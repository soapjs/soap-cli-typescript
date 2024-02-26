import {
  ConstructorTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { ComponentTemplates } from "../components";
import { ArgumentTemplate } from "./argument.template";
import { ParamTemplate } from "./param.template";
import { SuperTemplate } from "./super.template";

export const CONSTRUCTOR_TEMPLATE = `_ACCESS_ constructor(_PARAMS_) {
  _SUPER_
  _BODY_
}`;

export class ConstructorTemplate {
  static parse(
    model: ConstructorTemplateModel,
    project: ProjectDescription
  ): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, project);
    }

    const _ACCESS_ = `${model.access}` || "";
    const _PARAMS_ = model.params
      .map((p) => ParamTemplate.parse(p, project, { skipAccess: true }))
      .join(", ");
    let _SUPER_ = "";

    if (model.supr) {
      _SUPER_ = SuperTemplate.parse(model.supr, project);
    }

    let _BODY_ = "";

    if (model.body.template) {
      _BODY_ = `// ${model.body.instruction}`;
    } else if (model.body.content) {
      _BODY_ = model.body.content;
    }

    return CONSTRUCTOR_TEMPLATE.replace("_ACCESS_", _ACCESS_)
      .replace("_PARAMS_", _PARAMS_)
      .replace("_SUPER_", _SUPER_)
      .replace("_BODY_", _BODY_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
