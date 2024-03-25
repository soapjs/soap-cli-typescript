import {
  ParamTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { ArgumentTemplateBuilder } from "./argument.template-builder";

export type SuperTemplateContext = {
  args?: string;
};

export class SuperTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `super`;
  build(
    model: { params: ParamTemplateModel[] },
    project: ProjectDescription
  ): string {
    const context: SuperTemplateContext = {};
    if (model.params.length > 0) {
      context.args = model.params
        .map((p) =>
          this.builderProvider
            .get<ArgumentTemplateBuilder>(
              p.template || ArgumentTemplateBuilder.TemplateName
            )
            .build(p)
        )
        .join(", ");
    }

    return this.template(context);
  }
}
