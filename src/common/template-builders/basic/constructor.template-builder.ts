import {
  ConstructorTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { ParamTemplateBuilder } from "./param.template-builder";
import { BodyTemplateBuilder } from "./body.template-builder";
import { SuperTemplateBuilder } from "./super.template-builder";

export type ConstructorTemplateContext = {
  access?: string;
  params?: string;
  supr?: string;
  body?: string;
};

export class ConstructorTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `constructor`;

  build(model: ConstructorTemplateModel, project: ProjectDescription): string {
    const context: ConstructorTemplateContext = {};

    if (model.access) {
      context.access = model.access;
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
