import { ParamTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type ArgumentTemplateContext = {
  argument: string;
};

export class ArgumentTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `argument`;

  build(model: ParamTemplateModel): string {
    let argument;
    if (model.value) {
      argument =
        typeof model.value === "string"
          ? `"${model.value}"`
          : typeof model.value === "object"
            ? JSON.stringify(model.value, null, 2)
            : model.value;
    } else {
      argument = model.name;
    }

    return this.template({ argument });
  }
}
