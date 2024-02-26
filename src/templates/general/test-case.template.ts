import {
  ProjectDescription,
  TestCaseTemplateModel,
} from "@soapjs/soap-cli-common";
import { ComponentTemplates } from "../components";

export const TEST_CASE_TEMPLATE = `
  it.skip('_TITLE_', _ASYNC_() => {
    //
    expect(true).toBe(true);
  });`;

export class TestCaseTemplate {
  static parse(
    model: TestCaseTemplateModel,
    project: ProjectDescription
  ): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, project);
    }
    const _ASYNC_ = model ? "async " : "";
    const _TITLE_ = model.name;

    return TEST_CASE_TEMPLATE.replace("_TITLE_", _TITLE_)
      .replace("_ASYNC_", _ASYNC_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
