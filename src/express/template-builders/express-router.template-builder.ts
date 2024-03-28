import { ProjectDescription } from "@soapjs/soap-cli-common";
import {
  TemplateBuilder,
  TemplateRegistry,
} from "../../common/template-registry";

export type ExpressRouterTemplateContext = {
  imports: string[];
  props?: string;
};

export class ExpressRouterTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `express-router`;

  build(project: ProjectDescription): string {
    const imports = [];
    const params = [];

    if (project.ioc === "inversify") {
      imports.push(`import { Container } from 'inversify';`);
      params.push("protected container: Container");
    } else if (project.ioc === "singleton") {
      params.push("protected container: Soap.Container");
    } else {
      params.push("protected container: any");
    }

    params.push("protected config: Config");

    return this.template({
      imports,
      params: params.join(", "),
    });
  }
}
