import {
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export abstract class DependenciesTemplateModelFactory {
  abstract create(
    data: ComponentData,
    project: ProjectDescription
  ): FileTemplateModel;
}
