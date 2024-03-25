import { ProjectDescription, PropTemplateModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../template-registry";

export type PropTemplateOptions = {
  elementType: "class" | "interface" | "type";
};

export type PropTemplateContext = {
  name: string;
  access?: string;
  type?: string;
  is_optional?: boolean;
  is_readonly?: boolean;
  is_static?: boolean;
  value?: any;
};

export class PropTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `prop`;
  build(
    model: PropTemplateModel,
    project: ProjectDescription,
    options: PropTemplateOptions
  ): string {
    const elementType = options?.elementType || "class";

    const { name, access, is_optional, is_readonly, is_static, value, type } =
      model;
    const context: PropTemplateContext = {
      name,
      is_optional,
    };

    if (elementType === "class") {
      context.access = access || "public";
    }

    if (elementType === "class" && is_readonly) {
      context.is_readonly = is_readonly;
    }

    if (elementType === "class" && is_static) {
      context.is_static = is_static;
    }

    if (type) {
      context.type = type;
    }

    if (elementType === "class" && value) {
      context.value = value;
    }

    return this.template(context);
  }
}
