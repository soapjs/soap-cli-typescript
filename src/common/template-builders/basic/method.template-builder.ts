import {
  MethodTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { BodyTemplateBuilder } from "./body.template-builder";
import { ParamTemplateBuilder } from "./param.template-builder";
import { SuperTemplateBuilder } from "./super.template-builder";
import { GenericTemplateBuilder } from "./generic.template-builder";

export type MethodTemplateOptions = {
  elementType: "class" | "abstract_class" | "interface";
};

export type MethodTemplateContext = {
  name: string;
  is_async?: boolean;
  is_abstract?: boolean;
  is_static?: boolean;
  is_declaration?: boolean;
  access?: string;
  generics?: string;
  return_type?: string;
  params?: string;
  body?: string;
  supr?: string;
};

export class MethodTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `method`;
  build(
    model: MethodTemplateModel,
    project: ProjectDescription,
    options: MethodTemplateOptions
  ): string {
    const context: MethodTemplateContext = {
      name: model.name,
      is_declaration: options?.elementType === "interface",
      is_abstract: options?.elementType === "abstract_class",
      is_async: model.is_async,
      is_static: model.is_static,
    };

    if (model.access) {
      context.access = model.access;
    }

    if (model.return_type) {
      context.return_type = model.return_type;
    }

    if (model.generics.length > 0) {
      context.generics = model.generics
        .reduce((acc, generic) => {
          const genericTemplate =
            this.builderProvider.get<GenericTemplateBuilder>(
              generic.template || "generic"
            );
          acc.push(genericTemplate.build(generic));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.supr) {
      context.supr = this.builderProvider
        .get<SuperTemplateBuilder>(
          model.supr.template || SuperTemplateBuilder.TemplateName
        )
        .build(model.supr, project);
    }

    if (model.body) {
      context.body = this.builderProvider
        .get<BodyTemplateBuilder>(
          model.body.template || BodyTemplateBuilder.TemplateName
        )
        .build(model.body);
    }

    if (model.params.length > 0) {
      context.params = model.params
        .map((p) =>
          this.builderProvider
            .get<ParamTemplateBuilder>(
              p.template || ParamTemplateBuilder.TemplateName
            )
            .build(p, project, {
              skipAccess: true,
            })
        )
        .join(", ");
    }

    return this.template(context);
  }
}
