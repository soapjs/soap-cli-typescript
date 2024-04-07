import {
  ComponentData,
  FileTemplateModel,
  JsonTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export class ExpressRouteSchemaTemplateModelBuiler {
  private fileTemplateModels: Map<string, FileTemplateModel> = new Map();
  constructor(protected project: ProjectDescription) {}

  add(data: ComponentData) {
    const json = data.element.props.reduce((acc, prop) => {
      acc[prop.name] = prop.value;
      return acc;
    }, {});

    const model = new JsonTemplateModel(
      data.path,
      data.write_method,
      JSON.stringify(json, null, 2)
    );

    this.fileTemplateModels.set(data.path, model);

    return model;
  }

  build(): FileTemplateModel[] {
    return Array.from(this.fileTemplateModels, ([, value]) => value);
  }
}
