import {
  ConstructorTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { ComponentTemplates } from "../components";
import { ArgumentTemplate } from "./argument.template";

export class SuperTemplate {
  static parse(
    model: ConstructorTemplateModel,
    project: ProjectDescription
  ): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, project);
    }

    if (model.params.length > 0) {
      return `super(${model.params
        .reduce((acc, p) => {
          if (p) {
            acc.push(ArgumentTemplate.parse(p));
          }

          return acc;
        }, [])
        .join(", ")});`;
    }

    return "super();";
  }
}
