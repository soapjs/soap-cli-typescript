import {
  BindingDescriptor,
  BodyTemplateModel,
  ComponentData,
  ContainerAddons,
  FileTemplateModel,
  ProjectDescription,
  RepositoryBindings,
  SourceFileTemplateModel,
} from "@soapjs/soap-cli-common";
import {
  TypeScriptFileInfo,
  TypeScriptFileReader,
  TypeScriptImportInfo,
} from "../../common";
import { existsSync } from "fs";
import { ExpressDependencyBindTemplateBuilder } from "../template-builders/express-dependency-bind.template-builder";

export class ExpressDependenciesTemplateModelBuiler {
  private fileTemplateModel: FileTemplateModel;
  private fileReference: TypeScriptFileInfo;

  constructor(protected project: ProjectDescription) {}

  protected isBindingNotIncluded(
    name: string,
    imports: TypeScriptImportInfo[],
    binded = []
  ) {
    return (
      !!name &&
      !imports.some((i) => i.dflt === name || i.list.includes(name)) &&
      !binded.includes(name)
    );
  }

  protected processAddons(
    addons: ContainerAddons,
    imported: TypeScriptImportInfo[]
  ): ContainerAddons {
    return Object.entries(addons).reduce((acc, [category, bindings]) => {
      acc[category] = bindings
        .filter((binding: any) =>
          this.isBindingNotIncluded(binding.class_name, imported)
        )
        .map((binding: any) => {
          if (category === "repositories") {
            return {
              ...binding,
              contexts: binding.contexts.map((context: any) => ({
                ...context,
                include_source_init: this.isBindingNotIncluded(
                  context.source,
                  imported
                ),
              })),
            };
          }
          return binding;
        });
      return acc;
    }, {} as ContainerAddons);
  }

  public add(
    data: ComponentData<any, ContainerAddons>
  ): FileTemplateModel | null {
    const { addons } = data;
    if (
      Object.values(addons).every((addonCategory) => addonCategory.length === 0)
    ) {
      return null;
    }

    const configurator = data.element.methods.find((m) =>
      m.meta?.includes("isConfigurator")
    );
    if (!configurator) return null;

    if (existsSync(data.path)) {
      this.fileReference = TypeScriptFileReader.readFile(data.path);
    }

    const file = new SourceFileTemplateModel(data.path, data.write_method);
    file.update(data);

    const configuratorClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );
    if (!configuratorClass) return file;

    const configureMethod = configuratorClass.methods.find(
      (m) => m.name === configurator.name
    );
    if (!configureMethod) return file;

    const imported = this.fileReference?.imports ?? [];
    const dependencies = this.processAddons(addons, imported);

    const hasDependencies = Object.values(dependencies).some(
      (dep) => dep.length > 0
    );

    if (!hasDependencies) {
      return null;
    }

    configureMethod.body = BodyTemplateModel.create({
      template: ExpressDependencyBindTemplateBuilder.TemplateName,
      content: dependencies,
    });

    this.fileTemplateModel = file;
    return file;
  }

  // add(data: ComponentData<any, ContainerAddons>) {
  //   const { addons } = data;
  //   if (
  //     Object.values(addons).every((addonCategory) => addonCategory.length === 0)
  //   ) {
  //     return null;
  //   }

  //   const configurator = data.element.methods.find((m) =>
  //     m.meta?.includes("isConfigurator")
  //   );

  //   if (!configurator) return null;

  //   if (existsSync(data.path)) {
  //     this.fileReference = TypeScriptFileReader.readFile(data.path);
  //   }

  //   const file = new SourceFileTemplateModel(data.path, data.write_method);
  //   file.update(data);

  //   const configuratorClass = file.content.classes.find(
  //     (cls) => cls.name === data.type.name
  //   );

  //   if (configuratorClass) {
  //     const configureMethod = configuratorClass.methods.find(
  //       (m) => m.name === configurator.name
  //     );
  //     const categories = Object.keys(addons);
  //     let dependencies: ContainerAddons = {};

  //     const imported = this.fileReference ? this.fileReference.imports : [];

  //     categories.forEach((category) => {
  //       dependencies[category] = [];

  //       if (category === "repositories") {
  //         addons[category].forEach((repository) => {
  //           const { contexts, ...rest } = repository;
  //           let bindings: RepositoryBindings = {
  //             ...rest,
  //             contexts: [],
  //           };

  //           if (this.isBindingNotIncluded(bindings.class_name, imported)) {
  //             contexts.forEach((context) => {
  //               const include_source_init = this.isBindingNotIncluded(
  //                 context.source,
  //                 imported
  //               );
  //               bindings.contexts.push({ ...context, include_source_init });
  //             });

  //             dependencies[category].push(bindings);
  //           }
  //         });
  //       } else {
  //         data.addons[category].forEach((bindings: BindingDescriptor) => {
  //           if (this.isBindingNotIncluded(bindings.class_name, imported)) {
  //             dependencies[category].push(bindings);
  //           }
  //         });
  //       }
  //     });

  //     configureMethod.body = BodyTemplateModel.create({
  //       template: ExpressDependencyBindTemplateBuilder.TemplateName,
  //       content: dependencies,
  //     });
  //   }

  //   this.fileTemplateModel = file;

  //   return file;
  // }

  build(): FileTemplateModel {
    return this.fileTemplateModel;
  }
}
