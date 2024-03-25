import { ExportTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type ExportTemplateContext = {
  path: string;
  use_wildcard?: boolean;
  list?: string;
  alias?: string;
};

export class ExportTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `export`;

  build(model: ExportTemplateModel): string {
    const context: ExportTemplateContext = {
      path: model.path,
      use_wildcard: !!model.use_wildcard,
    };

    if (model.list) {
      context.list = model.list.join(", ");
    }

    if (model.alias) {
      context.alias = model.alias;
    }

    return this.template(context);
  }
}
