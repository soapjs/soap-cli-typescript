import { GenericTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type GenericTemplateContext = {
  name: string;
  inheritance?: string;
  dflt?: string;
};

export class GenericTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `generic`;

  build(model: GenericTemplateModel): string {
    const { name, dflt, inheritance } = model;
    const context: GenericTemplateContext = { name, dflt };

    if (inheritance) {
      context.inheritance = inheritance.name;
    }

    return this.template(context);
  }
}
