import {
  BodyTemplateModel,
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
  RouteMountModel,
  RouterAddons,
  SourceFileTemplateModel,
} from "@soapjs/soap-cli-common";
import { TypeScriptFileInfo, TypeScriptFileReader } from "../../common";
import { existsSync } from "fs";
import { ExpressRouteBindTemplateBuilder } from "../template-builders/express-route-bind.template-builder";

export class ExpressRouterTemplateModelBuiler {
  private fileTemplateModel: FileTemplateModel;
  private routerReference: TypeScriptFileInfo;

  constructor(protected project: ProjectDescription) {}

  getRoutes(addons) {
    let routes: RouteMountModel[] = [];
    const usedControllers = [];
    if (this.routerReference) {
      addons.routes.forEach((route) => {
        const { controller } = route;
        route.skip_controller_resolver =
          this.routerReference.imports.findIndex(
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

    return routes;
  }

  add(data: ComponentData<any, RouterAddons>) {
    const { addons } = data;
    const configurator = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isConfigurator")
    );

    if (this.routerReference === undefined) {
      if (existsSync(data.path)) {
        this.routerReference = TypeScriptFileReader.readFile(data.path);
      } else {
        this.routerReference = null;
      }
    }

    if (this.routerReference && addons.routes.length === 0) {
      return null;
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
        const routes: RouteMountModel[] = this.getRoutes(addons);
        configureMethod.body = BodyTemplateModel.create({
          content: routes,
          template: ExpressRouteBindTemplateBuilder.TemplateName,
        });
      }
    }

    this.fileTemplateModel = file;

    return file;
  }

  build(): FileTemplateModel {
    return this.fileTemplateModel;
  }
}
