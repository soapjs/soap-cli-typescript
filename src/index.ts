import {
  ApiObject,
  LanguagePluginConfig,
  PluginMap,
  ProjectDescription,
  Texts,
} from "@soapjs/soap-cli-common";
import ConfigJson from "./config/config.json";
import {
  BasicProjectBuildStrategy,
  ExpressProjectBuildStrategy,
  NestProjectBuildStrategy,
  AwsProjectBuildStrategy,
  ExpressProjectInitStrategy,
  NestProjectInitStrategy,
  AwsProjectInitStrategy,
  BasicProjectInitStrategy,
  TypeScriptFileOutputStrategy,
  ExpressTemplateModelStrategy,
  ExpressDependenciesTemplateModelFactory,
  ExpressRouterTemplateModelFactory,
  AwsDependenciesTemplateModelFactory,
  AwsRouterTemplateModelFactory,
  AwsTemplateModelStrategy,
  BasicDependenciesTemplateModelFactory,
  BasicRouterTemplateModelFactory,
  BasicTemplateModelStrategy,
  NestDependenciesTemplateModelFactory,
  NestRouterTemplateModelFactory,
  NestTemplateModelStrategy,
} from "./strategies";
import { IndexTemplateModelsFactory } from "./core";
import { GeneralTemplateModelsFactory } from "./core/general-template-models.factory";

export * from "./core";
export * from "./strategies";
export * from "./templates";

export const createTemplateModelStrategy = (...args: unknown[]) => ({
  apply: (api: ApiObject, project: ProjectDescription) => {
    if (project.web_framework === "express") {
      return new ExpressTemplateModelStrategy(
        new GeneralTemplateModelsFactory(),
        new IndexTemplateModelsFactory(),
        new ExpressDependenciesTemplateModelFactory(),
        new ExpressRouterTemplateModelFactory()
      ).apply(api, project);
    }

    if (project.web_framework === "nest") {
      return new NestTemplateModelStrategy(
        new GeneralTemplateModelsFactory(),
        new IndexTemplateModelsFactory(),
        new NestDependenciesTemplateModelFactory(),
        new NestRouterTemplateModelFactory()
      ).apply(api, project);
    }

    if (project.web_framework === "aws") {
      return new AwsTemplateModelStrategy(
        new GeneralTemplateModelsFactory(),
        new IndexTemplateModelsFactory(),
        new AwsDependenciesTemplateModelFactory(),
        new AwsRouterTemplateModelFactory()
      ).apply(api, project);
    }

    return new BasicTemplateModelStrategy(
      new GeneralTemplateModelsFactory(),
      new IndexTemplateModelsFactory(),
      new BasicDependenciesTemplateModelFactory(),
      new BasicRouterTemplateModelFactory()
    ).apply(api, project);
  },
});

export const createFileOutputStrategy = (...args: unknown[]) =>
  new TypeScriptFileOutputStrategy();
export const createProjectBuildStrategy = (
  texts: Texts,
  pluginMap: PluginMap,
  ...args: unknown[]
) => ({
  apply: (project: ProjectDescription) => {
    if (project.web_framework === "express") {
      return new ExpressProjectBuildStrategy(texts, pluginMap).apply(project);
    }

    if (project.web_framework === "nest") {
      return new NestProjectBuildStrategy(texts, pluginMap).apply(project);
    }

    if (project.web_framework === "aws") {
      return new AwsProjectBuildStrategy(texts, pluginMap).apply(project);
    }

    return new BasicProjectBuildStrategy(texts, pluginMap).apply(project);
  },
});

export const createProjectInitStrategy = (
  texts: Texts,
  pluginMap: PluginMap,
  ...args: unknown[]
) => ({
  apply: (project: ProjectDescription) => {
    if (project.web_framework === "express") {
      return new ExpressProjectInitStrategy(texts, pluginMap).apply(project);
    }

    if (project.web_framework === "nest") {
      return new NestProjectInitStrategy(texts, pluginMap).apply(project);
    }

    if (project.web_framework === "aws") {
      return new AwsProjectInitStrategy(texts, pluginMap).apply(project);
    }

    return new BasicProjectInitStrategy(texts, pluginMap).apply(project);
  },
});

export const Config: LanguagePluginConfig = ConfigJson;
