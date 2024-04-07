import {
  BodyTemplateModel,
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
  RouteAddons,
  RouterAddons,
  SourceFileTemplateModel,
} from "@soapjs/soap-cli-common";
import { RouteFactoryMethodTemplateBuilder } from "../../common";

export class ExpressRouteTemplateModelBuiler {
  private fileTemplateModels: Map<string, FileTemplateModel> = new Map();

  constructor(protected project: ProjectDescription) {}

  add(data: ComponentData<any, RouteAddons>) {
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

    this.fileTemplateModels.set(data.path, file);

    return file;
  }

  build(): FileTemplateModel[] {
    return Array.from(this.fileTemplateModels, ([, value]) => value);
  }
}
