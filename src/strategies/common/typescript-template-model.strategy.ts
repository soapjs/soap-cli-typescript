import {
  Strategy,
  FileTemplateModel,
  ApiObject,
  Result,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import {
  DependenciesTemplateModelFactory,
  IndexTemplateModelsFactory,
  RouterTemplateModelFactory,
} from "../../core";
import { GeneralTemplateModelsFactory } from "../../core/general-template-models.factory";

export class TypeScriptTemplateModelStrategy extends Strategy {
  constructor(
    protected generalTemplateModelsFactory: GeneralTemplateModelsFactory,
    protected indexTemplateModelsFactory: IndexTemplateModelsFactory,
    protected dependenciesTemplateModelFactory: DependenciesTemplateModelFactory,
    protected routerTemplateModelFactory: RouterTemplateModelFactory
  ) {
    super();
  }

  public apply(
    api: ApiObject,
    project: ProjectDescription
  ): Result<FileTemplateModel[]> {
    try {
      const models = this.generalTemplateModelsFactory.create(api, project);

      if (api.container?.dependencies?.length > 0) {
        const model = this.dependenciesTemplateModelFactory.create(
          api.container,
          project
        );
        models.push(model);
      }

      if (api.router?.dependencies?.length > 0) {
        const model = this.routerTemplateModelFactory.create(
          api.router,
          project
        );
        models.push(model);
      }

      const indexes = this.indexTemplateModelsFactory.create(models);

      return Result.withContent([...indexes, ...models]);
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
