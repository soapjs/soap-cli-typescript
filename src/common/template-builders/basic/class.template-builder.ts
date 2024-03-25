import {
  ClassTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { GenericTemplateBuilder } from "./generic.template-builder";
import { InheritanceTemplateBuilder } from "./inheritance.template-builder";
import { ConstructorTemplateBuilder } from "./constructor.template-builder";
import { PropTemplateBuilder } from "./prop.template-builder";
import { MethodTemplateBuilder } from "./method.template-builder";
import { ImplementedInterfaceTemplateBuilder } from "./implemented-interface.template-builder";

export type ClassTemplateContext = {
  export: string;
  default: boolean;
  abstract: boolean;
  name: string;
  inheritance?: string;
  generics?: string;
  interfaces?: string;
  static_props?: string[];
  static_methods?: string[];
  props?: string[];
  methods?: string[];
  decorators?: string[];
  ctor?: string;
};

export class ClassTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `class`;

  build(model: ClassTemplateModel, project: ProjectDescription): string {
    const { builderProvider } = this;
    const context: ClassTemplateContext = {
      export: model.exp ? "export" : "",
      default: model.exp?.is_default,
      abstract: model.isAbstract,
      name: model.name,
    };

    if (model.generics.length > 0) {
      context.generics = model.generics
        .reduce((acc, generic) => {
          const genericTemplate = builderProvider.get<GenericTemplateBuilder>(
            generic.template || GenericTemplateBuilder.TemplateName
          );
          acc.push(genericTemplate.build(generic));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.decorators.length > 0) {
      context.decorators = model.decorators.reduce((acc, decorator) => {
        acc.push(
          `@${decorator.name}(${decorator.args ? decorator.args.join(",") : ""})`
        );
        return acc;
      }, []);
    }

    if (model.inheritance.length > 0) {
      context.inheritance = model.inheritance
        .reduce((acc, inheritance) => {
          const inheritanceTemplate =
            builderProvider.get<InheritanceTemplateBuilder>(
              inheritance.template || InheritanceTemplateBuilder.TemplateName
            );
          acc.push(inheritanceTemplate.build(inheritance, project));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.interfaces.length > 0) {
      context.interfaces = model.interfaces
        .reduce((acc, i) => {
          const interfaceTemplate =
            builderProvider.get<ImplementedInterfaceTemplateBuilder>(
              i.template || ImplementedInterfaceTemplateBuilder.TemplateName
            );
          acc.push(interfaceTemplate.build(i, project));
          return acc;
        }, [])
        .join(", ");
    }

    if (model.ctor) {
      const ctorTemplate = builderProvider.get<ConstructorTemplateBuilder>(
        model.ctor.template || ConstructorTemplateBuilder.TemplateName
      );
      context.ctor = ctorTemplate.build(model.ctor, project);
    }

    const [static_props, props] = model.props.reduce(
      (acc, p) => {
        const propTemplate = builderProvider.get<PropTemplateBuilder>(
          p.template || PropTemplateBuilder.TemplateName
        );
        const temp = propTemplate.build(p, project, {
          elementType: "class",
        });
        if (p.is_static) {
          acc[0].push(temp);
        } else {
          acc[1].push(temp);
        }
        return acc;
      },
      [[], []]
    );

    if (static_props.length > 0) {
      context.static_props = static_props;
    }

    if (props.length > 0) {
      context.props = props;
    }

    const [static_methods, methods] = model.methods.reduce(
      (acc, m) => {
        const propTemplate = builderProvider.get<MethodTemplateBuilder>(
          m.template || MethodTemplateBuilder.TemplateName
        );
        const temp = propTemplate.build(m, project, {
          elementType: model.isAbstract ? "abstract_class" : "class",
        });
        if (m.is_static) {
          acc[0].push(temp);
        } else {
          acc[1].push(temp);
        }
        return acc;
      },
      [[], []]
    );

    if (static_methods.length > 0) {
      context.static_props = static_methods;
    }

    if (methods.length > 0) {
      context.methods = methods;
    }

    return this.template(context);
  }
}
