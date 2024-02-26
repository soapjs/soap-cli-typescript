import { BodyTemplateModel, ProjectDescription } from "@soapjs/soap-cli-common";
import { ComponentTemplates } from "../components";

export class BodyTemplate {
  static parse(model: BodyTemplateModel, project: ProjectDescription): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, project);
    }
    if (model.content) {
      return `/* ${model.content} */`;
    }

    return "";
  }
}
