import { extname } from "path";
import { ImportTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type ImportTemplateContext = {
  dflt?: string;
  path: string;
  list?: string;
  alias?: string;
};

export class ImportTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `import`;

  build(model: ImportTemplateModel): string {
    const ext = extname(model.path);
    const path = [".ts", ".js", ".tsx"].includes(ext)
      ? model.path.replace(ext, "")
      : model.path;

    const context: ImportTemplateContext = {
      path,
      alias: model.alias,
      dflt: model.dflt,
    };

    if (model.list) {
      context.list = model.list.join(", ");
    }

    return this.template(context);
  }
}
