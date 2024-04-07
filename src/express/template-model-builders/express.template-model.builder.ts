import {
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
  RouteAddons,
  RouterAddons,
  SourceFileTemplateModel,
} from "@soapjs/soap-cli-common";
import { TemplateModelBuilder } from "../../common";
import { ExpressIndexTemplateModelBuiler } from "./express-index.template-model.builder";
import { ExpressRouterTemplateModelBuiler } from "./express-router.template-model.builder";
import { ExpressRouteTemplateModelBuiler } from "./express-route.template-model.builder";
import { ExpressDependenciesTemplateModelBuiler } from "./express-dependencies.template-model.builder";
import { ExpressRouteSchemaTemplateModelBuiler } from "./express-route-schema.template-model.builder";

export class ExpressTemplateModelBuiler implements TemplateModelBuilder {
  private fileTemplateModels: Map<string, FileTemplateModel> = new Map();
  private indexModelBuilder: ExpressIndexTemplateModelBuiler;
  private routerModelBuilder: ExpressRouterTemplateModelBuiler;
  private routeModelBuilder: ExpressRouteTemplateModelBuiler;
  private routeSchemaModelBuilder: ExpressRouteSchemaTemplateModelBuiler;
  private dependenciesModelBuilder: ExpressDependenciesTemplateModelBuiler;

  constructor(protected project: ProjectDescription) {
    this.indexModelBuilder = new ExpressIndexTemplateModelBuiler(project);
    this.routerModelBuilder = new ExpressRouterTemplateModelBuiler(project);
    this.routeModelBuilder = new ExpressRouteTemplateModelBuiler(project);
    this.routeSchemaModelBuilder = new ExpressRouteSchemaTemplateModelBuiler(
      project
    );
    this.dependenciesModelBuilder = new ExpressDependenciesTemplateModelBuiler(
      project
    );
  }

  protected updateTemplateModel(data: ComponentData) {
    let file = this.fileTemplateModels.get(data.path);

    if (!file) {
      file = new SourceFileTemplateModel(data.path, data.write_method);
      this.fileTemplateModels.set(data.path, file);
    }
    file.update(data);

    return file;
  }

  add(data: ComponentData) {
    if (data.type.isContainer) {
      //
      this.dependenciesModelBuilder.add(data);
    } else if (data.type.isRouter) {
      //
      this.routerModelBuilder.add(data as ComponentData<any, RouterAddons>);
    } else if (data.type.isRoute) {
      //
      const file = this.routeModelBuilder.add(
        data as ComponentData<any, RouteAddons>
      );
      if (file) {
        this.indexModelBuilder.add(file);
      }
    } else if (data.type.isRouteSchema) {
      //
      this.routeSchemaModelBuilder.add(data);
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
        this.fileTemplateModels.set(file.path, file);
        this.indexModelBuilder.add(file);
      }
    }

    return this;
  }

  build(): FileTemplateModel[] {
    const files = Array.from(this.fileTemplateModels, ([, value]) => value);
    const indexes = this.indexModelBuilder.build();
    const routes = this.routeModelBuilder.build();
    const schemas = this.routeSchemaModelBuilder.build();
    
    const models = [...files, ...indexes, ...routes, ...schemas];
    
    const router = this.routerModelBuilder.build();
    if (router) {
      models.push(router);
    }
    
    const dependencies = this.dependenciesModelBuilder.build();
    if (dependencies) {
      models.push(dependencies);
    }

    return models;
  }
}
