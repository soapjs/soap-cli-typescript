import { extname } from "path";
import {
  ImportTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export const IMPORT_TEMPLATE = `import _IMPORT_ from "_PATH_";`;

export class ImportTemplate {
  static parse(
    model: ImportTemplateModel,
    project: ProjectDescription
  ): string {
    let _IMPORT_;

    const _PATH_ = model.path
      ? model.path.replace(extname(model.path), "")
      : "";

    if (model.alias) {
      _IMPORT_ = `* as ${model.alias}`;
    } else {
      let parts = [];

      if (model.dflt) {
        parts.push(model.dflt);
      }

      if (Array.isArray(model.list) && model.list.length > 0) {
        parts.push(`{ ${model.list.join(", ")} }`);
      }

      _IMPORT_ = parts.join(", ");
    }

    return IMPORT_TEMPLATE.replace("_IMPORT_", _IMPORT_)
      .replace("_PATH_", _PATH_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n")
      .trim();
  }
}
