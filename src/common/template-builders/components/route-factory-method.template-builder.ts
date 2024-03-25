import {
  MethodTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { ExpressRouteFactoryMethodTemplateBuilder } from "../../../express/templates/express-route-factory-method.template-builder";

export class RouteFactoryMethodTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `route-factory-method`;

  build(model: MethodTemplateModel, project: ProjectDescription): string {
    if (project.web_framework === "express") {
      const builder = this.builderProvider.get(
        ExpressRouteFactoryMethodTemplateBuilder.TemplateName
      );
      return builder.build(model.body.content, project);
    }
  }
}
