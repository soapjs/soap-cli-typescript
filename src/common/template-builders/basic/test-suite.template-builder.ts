import {
  ProjectDescription,
  TestSuiteTemplateModel,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { TestCaseTemplateBuilder } from "./test-case.template-builder";

export type TestSuiteTemplateContext = {
  name: string;
  tests?: string[];
};

export class TestSuiteTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `test-suite`;

  build(model: TestSuiteTemplateModel, project: ProjectDescription): string {
    const context: TestSuiteTemplateContext = { name: model.name };
    context.tests = model.tests.map((t) => {
      return this.builderProvider
        .get(TestCaseTemplateBuilder.TemplateName)
        .build(t, project);
    });

    return this.template(context);
  }
}
