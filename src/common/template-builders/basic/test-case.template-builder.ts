import {
  ProjectDescription,
  TestCaseTemplateModel,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type TestCaseTemplateContext = {
  name: string;
  group?: string;
  is_async?: boolean;
  methods?: any[];
  props?: any[];
};

export class TestCaseTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `test-case`;

  build(model: TestCaseTemplateModel, project: ProjectDescription): string {
    const context: TestCaseTemplateContext = {
      name: model.name,
      is_async: model.is_async,
    };

    return this.template(context);
  }
}
