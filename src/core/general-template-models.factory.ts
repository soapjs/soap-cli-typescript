import {
  ApiObject,
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export class GeneralTemplateModelsFactory {
  protected updateTemplateModel(
    files: Map<string, FileTemplateModel>,
    data: ComponentData
  ) {
    let file = files.get(data.path);

    if (!file) {
      file = new FileTemplateModel(data.path, data.write_method);
      files.set(data.path, file);
    }
    file.update(data);
  }

  create(api: ApiObject, project: ProjectDescription): FileTemplateModel[] {
    try {
      const templateModels = new Map<string, FileTemplateModel>();

      api.controllers.forEach((item) => {
        this.updateTemplateModel(templateModels, item);
      });
      api.entities.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.mappers.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.models.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.repositories.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.repository_factories.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.repository_impls.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.route_ios.forEach((item) => {
        this.updateTemplateModel(templateModels, item);
      });
      api.routes.forEach((item) => {
        this.updateTemplateModel(templateModels, item);
      });
      api.collections.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.toolsets.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.services.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.use_cases.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.test_suites.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );

      return Array.from(templateModels, ([, value]) => value);
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
