import {
  Strategy,
  FileTemplateModel,
  ApiObject,
  Result,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import { TemplateModelBuilder } from "../template-model.builder";

export class TypeScriptTemplateModelStrategy extends Strategy {
  constructor(protected templateModelBuilder: TemplateModelBuilder) {
    super();
  }

  public apply(
    api: ApiObject,
    project: ProjectDescription
  ): Result<FileTemplateModel[]> {
    try {
      const { templateModelBuilder } = this;

      api.controllers.forEach((item) => {
        templateModelBuilder.add(item);
      });
      api.entities.forEach((item) => templateModelBuilder.add(item));
      api.mappers.forEach((item) => templateModelBuilder.add(item));
      api.models.forEach((item) => templateModelBuilder.add(item));
      api.route_models.forEach((item) => templateModelBuilder.add(item));
      api.repositories.forEach((item) => templateModelBuilder.add(item));
      api.repository_impls.forEach((item) => templateModelBuilder.add(item));
      api.routes.forEach((item) => {
        templateModelBuilder.add(item);
      });
      api.route_ios.forEach((item) => {
        templateModelBuilder.add(item);
      });
      api.route_schemas.forEach((item) => {
        templateModelBuilder.add(item);
      });
      api.collections.forEach((item) => templateModelBuilder.add(item));
      api.toolsets.forEach((item) => templateModelBuilder.add(item));
      api.services.forEach((item) => templateModelBuilder.add(item));
      api.service_impls.forEach((item) => templateModelBuilder.add(item));
      api.use_cases.forEach((item) => templateModelBuilder.add(item));
      api.test_suites.forEach((item) => templateModelBuilder.add(item));

      templateModelBuilder.add(api.container);
      templateModelBuilder.add(api.router);

      return Result.withContent(templateModelBuilder.build());
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
