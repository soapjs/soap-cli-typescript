import {
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export abstract class RouterTemplateModelFactory {
  abstract create(
    data: ComponentData,
    project: ProjectDescription
  ): FileTemplateModel;
}
