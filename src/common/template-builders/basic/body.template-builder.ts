import { BodyTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type BodyTemplateContext = {
  content: string;
};

export class BodyTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `body`;
  build(model: BodyTemplateModel): string {
    return this.template(model);
  }
}
