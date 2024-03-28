# @soapjs/soap-cli-typescript

The `@soapjs/soap-cli-typescript` package includes configurations (in JSON format), classes, types, `Handlebars` templates, and template builders needed for generating API component code in `TypeScript`. This package is automatically fetched to the global instance of `SoapJS` CLI on the user's machine as soon as they initialize a project and choose `TypeScript` as their language. 


It contains the core `TypeScript` elements such as `classes`, `types`, `methods`, `properties`, `imports`, etc. The code generation is based on numerous smaller templates instead of being bound to clean architecture components, due to the framework's flexibility. Users can change names, default parameters, methods, etc., in the JSON file, and the package code, based on those configurations and data provided in the CLI/JSON by the user, generates `TypeScript` files. 

In addition to the basic elements, there are also individual templates and template builders for components not modified by the user. The generated code can include classes for: 
- Express
- NestJS (WiP)
- AWS Lambdas (WiP)
- Inversify
- default components of SoapJS

as chosen by the user. As of writing this README, ExpressJS is implemented, with other frameworks being WIP. Future updates may add more frameworks. The structure of files and code is based on `commons` containing strategy implementations triggered based on commands called by the user. The code in this package runs in the main thread, and content generation, as well as file generation, is handled in workers, all managed by the main CLI code. This package, like others, must export the following parts:

```typescript
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
```

The code generation occurs in the following phases:
- The user provides project/component data through the CLI forms or JSON file with a predefined structure. Based on this data, a strategy for building data models for templates contained in this package is activated.
- Having templates, we create content for files based on models and Handlebars templates.
- Data is grouped to save the entire content of a specific file without the need to open it each time.
- After saving files, logs are displayed with a list of created/modified or skipped files.

Here are the strategies we have:
- `TypeScriptFileDescriptorStrategy` - creates/updates the code of API components (activated with each `soap new <component_type>` command).
- `TypeScriptProjectBuildStrategy` - builds the project (activated with the `soap new project` command).
- `TypeScriptProjectInitStrategy` - adds soapJS to an existing project (activated with the `soap init` command).

There is still much to do, including code for NestJS and AWS Lambdas, which will be addressed.

This package is not used directly and does not need to be manually installed, but it's worth getting acquainted with because templates and TypeScript configurations from this package are copied to the `.soap` directory in the project. Users may change the template code and configurations in their project; however, these changes will only work within that specific project and not globally.

## Issues
If you encounter any issues, please feel free to report them [here](https://github.com/soapjs/soap/issues/new/choose).

## Contact
For any questions, collaboration interests, or support needs, you can contact us through the following:

- Official:
  - Email: [contact@soapjs.com](mailto:contact@soapjs.com)
  - Website: https://soapjs.com
- Radoslaw Kamysz:
  - Email: [radoslaw.kamysz@gmail.com](mailto:radoslaw.kamysz@gmail.com)
  - Warpcast: [@k4mr4ad](https://warpcast.com/k4mr4ad)
  - Twitter: [@radoslawkamysz](https://x.com/radoslawkamysz)

## License

@soapjs/soap-cli-typescript is [MIT licensed](./LICENSE).