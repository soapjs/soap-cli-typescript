import {
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export interface TemplateModelBuilder {
  add(data: ComponentData): this;
  build(): FileTemplateModel[];
}
