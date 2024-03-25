import { ProjectDescription } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../common/template-registry";

export type ExpressLauncherTemplateContext = {
  use_inversify: boolean;
  imports: string[];
};

export class ExpressLauncherTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `express-launcher`;

  build(project: ProjectDescription): string {
    const context: ExpressLauncherTemplateContext = {
      use_inversify: project.ioc === "inversify",
      imports: [],
    };

    if (project.ioc === "inversify") {
      context.imports.push(`import { Container } from 'inversify';`);
    }

    return this.template(context);
  }
}
