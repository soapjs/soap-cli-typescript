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
    const props = [];

    if (project.ioc === "inversify") {
      imports.push(`import { Container } from 'inversify';`);
      props.push("container: Container");
    } else if (project.ioc === "singleton") {
      props.push("container: Soap.Container");
    } else {
      props.push("container: any");
    }

    props.push("config: Config");

    return this.template({
      imports,
      props: props.join(", "),
    });
  }
}
