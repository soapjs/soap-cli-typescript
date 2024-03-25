import { ProjectDescription, TypeTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { GenericTemplateBuilder } from "./generic.template-builder";
import { PropTemplateBuilder } from "./prop.template-builder";

export type TypeTemplateContext = {
  name: string;
  alias?: string;
  is_exportable?: boolean;
  is_default?: boolean;
  props?: string[];
  generics?: string;
};

export class TypeTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `type`;

  build(model: TypeTemplateModel, project: ProjectDescription): string {
    const context: TypeTemplateContext = { name: model.name };

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

    if (model.props.length > 0) {
      context.props = model.props.reduce((acc, prop) => {
        const propTemplate = this.builderProvider.get<PropTemplateBuilder>(
          prop.template || "prop"
        );
        acc.push(propTemplate.build(prop, project, { elementType: "type" }));
        return acc;
      }, []);
    }

    if (model.exp) {
      context.is_exportable = true;
      context.is_default = model.exp.is_default;
    }

    if (model.alias) {
      context.alias = model.alias;
    }

    return this.template(context);
  }
}
