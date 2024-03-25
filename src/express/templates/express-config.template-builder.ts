import { TemplateBuilder } from "../../common/template-registry";

export type ExpressConfigTemplateContext = {};

export class ExpressConfigTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `express-config`;

  build(): string {
    return this.template({});
  }
}
