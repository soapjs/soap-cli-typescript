import {
  SourceCodeTemplateContent,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import {
  ImportTemplateBuilder,
  ExportTemplateBuilder,
  TypeTemplateBuilder,
  FunctionTemplateBuilder,
  ClassTemplateBuilder,
  TestSuiteTemplateBuilder,
} from "..";

export class TypeScriptFileTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `typescript-file`;

  build(content: SourceCodeTemplateContent, project: ProjectDescription) {
    const imports = content.imports.map((i) =>
      this.builderProvider
        .get(i.template || ImportTemplateBuilder.TemplateName)
        .build(i, project)
    );
    const exports = content.exports.map((i) =>
      this.builderProvider
        .get(i.template || ExportTemplateBuilder.TemplateName)
        .build(i, project)
    );
    const types = content.types.map((i) =>
      this.builderProvider
        .get(i.template || TypeTemplateBuilder.TemplateName)
        .build(i, project)
    );
    const functions = content.functions.map((i) =>
      this.builderProvider
        .get(i.template || FunctionTemplateBuilder.TemplateName)
        .build(i, project)
    );
    const classes = content.classes.map((i) =>
      this.builderProvider
        .get(i.template || ClassTemplateBuilder.TemplateName)
        .build(i, project)
    );
    const test_suites = content.test_suites.map((i) =>
      this.builderProvider
        .get(i.template || TestSuiteTemplateBuilder.TemplateName)
        .build(i, project)
    );

    return this.template({
      imports,
      exports,
      types,
      functions,
      classes,
      test_suites,
      has_imports: imports.length > 0,
      has_exports: exports.length > 0,
      has_types: types.length > 0,
      has_functions: functions.length > 0,
      has_classes: classes.length > 0,
      has_test_suites: test_suites.length > 0,
    });
  }
}
