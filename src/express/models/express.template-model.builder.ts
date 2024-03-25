import {
  BindingDescriptor,
  BodyTemplateModel,
  ComponentData,
  ContainerAddons,
  ExportTemplateModel,
  FileTemplateModel,
  ImportData,
  JsonTemplateModel,
  ProjectDescription,
  RepositoryBindings,
  RouteAddons,
  RouteMountModel,
  RouterAddons,
  SourceFileTemplateModel,
  TypeInfo,
  WriteMethod,
  workerLog,
} from "@soapjs/soap-cli-common";
import {
  RouteFactoryMethodTemplateBuilder,
  TemplateModelBuilder,
  TypeScriptFileInfo,
  TypeScriptFileReader,
  TypeScriptImportInfo,
} from "../../common";
import { existsSync } from "fs";
import { ExpressDependencyBindTemplateBuilder } from "../templates/express-dependency-bind.template-builder";
import { ExpressRouteBindTemplateBuilder } from "../templates/express-route-bind.template-builder";
import { dirname, join, relative, basename, extname } from "path";

export class ExpressTemplateModelBuiler implements TemplateModelBuilder {
  private files: Map<string, FileTemplateModel> = new Map();

  constructor(protected project: ProjectDescription) {}

  protected updateTemplateModel(data: ComponentData) {
    let file = this.files.get(data.path);

    if (!file) {
      file = new SourceFileTemplateModel(data.path, data.write_method);
      this.files.set(data.path, file);
    }
    file.update(data);

    return file;
  }

  protected buildIndexTemplateModel(file: FileTemplateModel) {
    if (file.write_method === WriteMethod.Skip) {
      return;
    }

    const indexPath = join(dirname(file.path), "index.ts");
    const tempExportedPath = join(
      relative(dirname(indexPath), dirname(file.path)),
      basename(file.path).replace(extname(file.path), "")
    );
    const exportedPath = tempExportedPath.startsWith(".")
      ? tempExportedPath
      : `./${tempExportedPath}`;

    let index = this.files.get(indexPath);

    const entry = ExportTemplateModel.create({
      use_wildcard: true,
      path: exportedPath,
    });

    if (!index) {
      index = new SourceFileTemplateModel(indexPath, WriteMethod.Write, {
        exports: [entry],
      });
      this.files.set(index.path, index);
    } else if (
      index.content.exports.findIndex((e) => e.path === exportedPath) === -1
    ) {
      index.content.exports.push(entry);
    }
  }

  protected buildRouteTemplateModel(data: ComponentData<any, RouteAddons>) {
    const { addons } = data;

    const file = new SourceFileTemplateModel(data.path, data.write_method);
    file.update(data);

    const routeClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );
    const factoryMethodData = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isRouteFactoryMethod")
    );

    if (routeClass && factoryMethodData) {
      const factoryMethod = routeClass.methods.find(
        (m) => m.name === factoryMethodData.name
      );

      if (factoryMethod) {
        factoryMethod.template = RouteFactoryMethodTemplateBuilder.TemplateName;
        factoryMethod.body = BodyTemplateModel.create({
          content: {
            methodName: factoryMethod.name,
            ...addons,
          },
        });
      }
    }

    return file;
  }

  protected buildRouterTemplateModel(data: ComponentData<any, RouterAddons>) {
    const { addons } = data;
    let ref: TypeScriptFileInfo;
    const configurator = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isConfigurator")
    );

    if (existsSync(data.path)) {
      ref = TypeScriptFileReader.readFile(data.path);
    }

    const file = new SourceFileTemplateModel(data.path, data.write_method);
    file.update(data);

    const configuratorClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );
    if (configuratorClass) {
      const configureMethod = configuratorClass.methods.find(
        (m) => m.name === configurator.name
      );

      if (configureMethod) {
        let routes: RouteMountModel[] = [];
        const usedControllers = [];
        if (ref) {
          addons.routes.forEach((route) => {
            const { controller } = route;
            route.skip_controller_resolver =
              ref.imports.findIndex(
                (i) => i.dflt === controller || i.list.includes(controller)
              ) > -1 || usedControllers.indexOf(controller) > -1;
            usedControllers.push(controller);
            routes.push(route);
          });
        } else {
          addons.routes.forEach((route) => {
            const { controller } = route;
            route.skip_controller_resolver =
              usedControllers.indexOf(controller) > -1;
            usedControllers.push(controller);
            routes.push(route);
          });
        }

        configureMethod.body = BodyTemplateModel.create({
          content: routes,
          template: ExpressRouteBindTemplateBuilder.TemplateName,
        });
      }
    }

    return file;
  }

  protected isBindingNotIncluded(
    name: string,
    imports: TypeScriptImportInfo[],
    binded = []
  ) {
    return (
      name &&
      imports.findIndex((i) => i.dflt === name || i.list.includes(name)) ===
        -1 &&
      binded.findIndex((b) => b === name) === -1
    );
  }

  protected buildDependenciesTemplateModel(
    data: ComponentData<any, ContainerAddons>
  ) {
    const { addons } = data;
    if (
      addons.controllers.length === 0 &&
      addons.repositories.length === 0 &&
      addons.services.length === 0 &&
      addons.toolsets.length === 0 &&
      addons.use_cases.length === 0
    ) {
      return null;
    }

    let ref: TypeScriptFileInfo;
    const configurator = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isConfigurator")
    );

    if (existsSync(data.path)) {
      ref = TypeScriptFileReader.readFile(data.path);
    }

    const file = new SourceFileTemplateModel(data.path, data.write_method);
    file.update(data);

    const configuratorClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );

    if (configuratorClass) {
      const configureMethod = configuratorClass.methods.find(
        (m) => m.name === configurator.name
      );
      const categories = Object.keys(addons);
      let dependencies: ContainerAddons = {};

      const imported = ref ? ref.imports : [];

      categories.forEach((category) => {
        dependencies[category] = [];

        if (category === "repositories") {
          addons[category].forEach((repository) => {
            const { contexts, ...rest } = repository;
            let bindings: RepositoryBindings = {
              ...rest,
              contexts: [],
            };

            if (this.isBindingNotIncluded(bindings.class_name, imported)) {
              contexts.forEach((context) => {
                const include_source_init = this.isBindingNotIncluded(
                  context.source,
                  imported
                );
                bindings.contexts.push({ ...context, include_source_init });
              });

              dependencies[category].push(bindings);
            }
          });
        } else {
          data.addons[category].forEach((bindings: BindingDescriptor) => {
            if (this.isBindingNotIncluded(bindings.class_name, imported)) {
              dependencies[category].push(bindings);
            }
          });
        }
      });

      configureMethod.body = BodyTemplateModel.create({
        template: ExpressDependencyBindTemplateBuilder.TemplateName,
        content: dependencies,
      });
    }

    return file;
  }

  protected buildRouteSchemaJsonModel(data: ComponentData) {
    const json = data.element.props.reduce((acc, prop) => {
      acc[prop.name] = prop.value;
      return acc;
    }, {});

    return new JsonTemplateModel(
      data.path,
      data.write_method,
      JSON.stringify(json, null, 2)
    );
  }

  add(data: ComponentData) {
    if (data.type.isContainer) {
      //
      const file = this.buildDependenciesTemplateModel(data);
      if (file) {
        this.files.set(file.path, file);
      }
    } else if (data.type.isRouter) {
      //
      const file = this.buildRouterTemplateModel(
        data as ComponentData<any, RouterAddons>
      );
      if (file) {
        this.files.set(file.path, file);
      }
    } else if (data.type.isRoute) {
      //
      const file = this.buildRouteTemplateModel(
        data as ComponentData<any, RouteAddons>
      );
      if (file) {
        this.files.set(file.path, file);
        this.buildIndexTemplateModel(file);
      }
    } else if (data.type.isRouteSchema) {
      //
      const file = this.buildRouteSchemaJsonModel(data);
      if (file) {
        this.files.set(file.path, file);
      }
    } else {
      if (
        data.type.isController ||
        data.type.isUseCase ||
        data.type.isRepository ||
        data.type.isService ||
        data.type.isToolset
      ) {
        data.element.props.push({
          is_static: true,
          is_readonly: false,
          is_optional: false,
          name: "Token",
          type: {
            name: "string",
            ref: "string",
            tag: "string",
          },
          value: `"${data.element.name}"`,
          template: "prop",
          access: "public",
        });
        if (this.project.ioc === "inversify") {
          data.element.decorators = [{ name: "injectable" }];
          data.element.imports.push({
            list: ["injectable"],
            path: "inversify",
            dflt: null,
            alias: null,
          });
        }
      }
      const file = this.updateTemplateModel(data);
      if (file) {
        this.files.set(file.path, file);
        this.buildIndexTemplateModel(file);
      }
    }

    return this;
  }

  build(): FileTemplateModel[] {
    return Array.from(this.files, ([, value]) => value);
  }
}
