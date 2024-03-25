import {
  FunctionTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { GenericTemplateBuilder } from "./generic.template-builder";
import { ParamTemplateBuilder } from "./param.template-builder";
import { BodyTemplateBuilder } from "./body.template-builder";

export type FunctionTemplateContext = {
  export?: string;
  is_async?: boolean;
  name: string;
  generics?: string;
  params?: string;
  return_type?: string;
  body?: string;
};

export class FunctionTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `function`;

  build(model: FunctionTemplateModel, project: ProjectDescription): string {
    const { builderProvider } = this;
    const context: FunctionTemplateContext = {
      name: model.name,
      is_async: model.is_async,
    };

    if (model.generics.length > 0) {
      context.generics = model.generics
        .reduce((acc, generic) => {
          const genericTemplate = builderProvider.get<GenericTemplateBuilder>(
            generic.template || "generic"
          );
          acc.push(genericTemplate.build(generic));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.params.length > 0) {
      context.params = model.params
        .reduce((acc, param) => {
          const paramTemplate = builderProvider.get<ParamTemplateBuilder>(
            param.template || "param"
          );
          acc.push(paramTemplate.build(param, project));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.return_type) {
      context.return_type = model.return_type;
    }

    if (model.body) {
      context.body = builderProvider
        .get<BodyTemplateBuilder>(
          model.body.template || BodyTemplateBuilder.TemplateName
        )
        .build(model.body);
    }

    return this.template(context);
  }
}
