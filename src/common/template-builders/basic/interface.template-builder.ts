import {
  GenericTemplateModel,
  InheritanceTemplateModel,
  InterfaceTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { PropTemplateBuilder } from "./prop.template-builder";
import { InheritanceTemplateBuilder } from "./inheritance.template-builder";
import { GenericTemplateBuilder } from "./generic.template-builder";
import { MethodTemplateBuilder } from "./method.template-builder";

export type InterfaceTemplateContext = {
  name: string;
  inheritance?: string;
  props?: string[];
  methods?: string[];
  generics?: string;
};

export class InterfaceTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `interface`;

  build(model: InterfaceTemplateModel, project: ProjectDescription): string {
    const context: InterfaceTemplateContext = { name: model.name };

    if (model.generics.length > 0) {
      context.generics = model.generics
        .reduce((acc, generic) => {
          const genericTemplate =
            this.builderProvider.get<GenericTemplateBuilder>(
              generic.template || "generic"
            );
          acc.push(genericTemplate.build(GenericTemplateModel.create(generic)));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.inheritance.length > 0) {
      context.inheritance = model.inheritance
        .reduce((acc, inheritance) => {
          const inheritanceTemplate =
            this.builderProvider.get<InheritanceTemplateBuilder>(
              inheritance.template || "inheritance"
            );
          acc.push(
            inheritanceTemplate.build(
              InheritanceTemplateModel.create(inheritance),
              project
            )
          );
          return acc;
        }, [])
        .join(", ");
    }

    if (model.props.length > 0) {
      context.props = model.props.reduce((acc, prop) => {
        const propTemplate = this.builderProvider.get<PropTemplateBuilder>(
          prop.template || "prop"
        );
        acc.push(
          propTemplate.build(prop, project, { elementType: "interface" })
        );
        return acc;
      }, []);
    }

    if (model.methods.length > 0) {
      context.methods = model.methods.reduce((acc, method) => {
        const methodTemplate = this.builderProvider.get<MethodTemplateBuilder>(
          method.template || "method"
        );
        acc.push(
          methodTemplate.build(method, project, {
            elementType: "interface",
          })
        );
        return acc;
      }, []);
    }

    return this.template(context);
  }
}
