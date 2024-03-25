import {
  ParamTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type ParamTemplateContext = {
  name: string;
  access?: string;
  type?: string;
  is_optional?: boolean;
  is_readonly?: boolean;
  value?: any;
};

export type ParamTemplateOptions = { skipAccess?: boolean; skipType?: boolean };

export class ParamTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `param`;
  build(
    model: ParamTemplateModel,
    project: ProjectDescription,
    options?: ParamTemplateOptions
  ): string {
    const { access, is_optional, is_readonly, value, type } = model;
    const context: ParamTemplateContext = {
      name: model.name,
      is_optional,
      is_readonly,
      value,
    };

    if (access && !options?.skipAccess) {
      context.access = access;
    }

    if (type && !options?.skipType) {
      context.type = type;
    }

    return this.template(context);
  }
}
