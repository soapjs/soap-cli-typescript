import { join } from "path";
import {
  ApiObject,
  FileDescriptor,
  FileTemplateModel,
  PluginConfig,
  PluginMap,
  ProjectDescription,
  Result,
  TemplateSchemaMap,
  Texts,
} from "@soapjs/soap-cli-common";
import {
  TypeScriptFileDescriptorStrategy,
  TypeScriptTemplateModelStrategy,
  TemplateModelBuilder,
  TemplateService,
  TemplateRegistry,
  setupBasicTemplates,
} from "./common";
import {
  ExpressProjectBuildStrategy,
  ExpressProjectInitStrategy,
  ExpressTemplateModelBuiler,
  setupExpressTemplates,
} from "./express";
import ConfigJson from "./config/config.json";

const templatesPath = `${process.cwd()}/.soap/templates/`;
const templateRegistry = new TemplateRegistry();

export const setupTemplates = async (project: ProjectDescription) => {
  return TemplateService.fetch([
    join(templatesPath, "basic"),
    join(templatesPath, project.web_framework),
  ]);
};

export const createTemplateModels = (
  obj: ApiObject,
  project: ProjectDescription,
  ...args: unknown[]
): Result<FileTemplateModel[]> => {
  let modelBuilder: TemplateModelBuilder;

  if (project.web_framework === "express") {
    modelBuilder = new ExpressTemplateModelBuiler(project);
  }
  return new TypeScriptTemplateModelStrategy(modelBuilder).apply(obj, project);
};

export const createFileDescriptors = (
  models: FileTemplateModel[],
  templates: TemplateSchemaMap,
  project: ProjectDescription,
  ...args: unknown[]
): Promise<Result<FileDescriptor[]>> => {
  setupBasicTemplates(templateRegistry, templates);

  if (project.web_framework === "express") {
    setupExpressTemplates(templateRegistry, templates);
  }

  return new TypeScriptFileDescriptorStrategy(templateRegistry).apply(
    models,
    project
  );
};

export const buildProject = (
  texts: Texts,
  pluginMap: PluginMap,
  templates: TemplateSchemaMap,
  content: ProjectDescription,
  ...args: unknown[]
): Promise<Result> => {
  if (content.web_framework === "express") {
    return new ExpressProjectBuildStrategy(
      texts,
      pluginMap,
      templateRegistry
    ).apply(content);
  }
};

export const initProject = (
  texts: Texts,
  pluginMap: PluginMap,
  templates: TemplateSchemaMap,
  content: ProjectDescription,
  ...args: unknown[]
): Promise<Result> => {
  if (content.web_framework === "express") {
    return new ExpressProjectInitStrategy(
      texts,
      pluginMap,
      templateRegistry
    ).apply(content);
  }
};

export const default_config: PluginConfig = ConfigJson;
