import prettier from "prettier";

import {
  ClassTemplate,
  ExportTemplate,
  FunctionTemplate,
  ImportTemplate,
  TypeTemplate,
  TestSuiteTemplate,
} from "../templates";
import {
  FileTemplateContent,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export const FILE_TEMPLATE = `
_IMPORTS_
_EXPORTS_
_TYPES_
_FUNCTIONS_
_CLASSES_
_TEST_SUITES_
`;

export class TypeScriptFileTemplate {
  static async parse(
    content: FileTemplateContent,
    project: ProjectDescription
  ) {
    const { imports, classes, types, functions, test_suites } = content;

    const _IMPORTS_ = imports.map((i) => ImportTemplate.parse(i, project)).join(`
`);
    const _EXPORTS_ = content.exports.map((i) => ExportTemplate.parse(i, project)).join(`
`);
    const _TYPES_ = types.map((i) => TypeTemplate.parse(i, project)).join(`
`);
    const _FUNCTIONS_ = functions.map((i) => FunctionTemplate.parse(i, project)).join(`
`);
    const _CLASSES_ = classes.map((i) => ClassTemplate.parse(i, project)).join(`
`);
    const _TEST_SUITES_ = test_suites.map((i) => TestSuiteTemplate.parse(i, project))
      .join(`
`);

    const code = FILE_TEMPLATE.replace("_IMPORTS_", _IMPORTS_)
      .replace("_EXPORTS_", _EXPORTS_)
      .replace("_TYPES_", _TYPES_)
      .replace("_FUNCTIONS_", _FUNCTIONS_)
      .replace("_CLASSES_", _CLASSES_)
      .replace("_TEST_SUITES_", _TEST_SUITES_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "");

    return prettier.format(code, { parser: "typescript" });
  }
}
