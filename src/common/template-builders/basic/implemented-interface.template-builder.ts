import {
  GenericTemplateModel,
  InterfaceTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";
import { GenericTemplateBuilder } from "./generic.template-builder";

export type ImplementedInterfaceTemplateContext = {
  name: string;
  generics?: string;
};

export class ImplementedInterfaceTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `implemented-interface`;
  build(model: InterfaceTemplateModel, project: ProjectDescription): string {
    const context: ImplementedInterfaceTemplateContext = { name: model.name };

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

    return this.template(context);
  }
}
