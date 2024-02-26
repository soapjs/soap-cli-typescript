import {
  BodyTemplateModel,
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import {
  DependenciesTemplateModelFactory,
  TypeScriptFileInfo,
  TypeScriptFileReader,
} from "../../core";
import { existsSync } from "fs";
import { ComponentTemplates } from "../../templates";

export class ExpressDependenciesTemplateModelFactory extends DependenciesTemplateModelFactory {
  create(data: ComponentData, project: ProjectDescription): FileTemplateModel {
    let ref: TypeScriptFileInfo;
    const configurator = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isConfigurator")
    );

    if (existsSync(data.path)) {
      ref = TypeScriptFileReader.readFile(data.path);
    }

    const file = new FileTemplateModel(data.path, data.write_method);
    file.update(data);

    const configuratorClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );
    if (configuratorClass) {
      const configureMethod = configuratorClass.methods.find(
        (m) => m.name === configurator.name
      );

      if (configureMethod) {
        let content;
        if (ref) {
          content = data.dependencies.reduce((acc, c) => {
            const notImported =
              ref.imports.findIndex(
                (i) => i.dflt === c.type.name || i.list.includes(c.type.name)
              ) === -1;
            if (notImported) {
              acc.push(c.type);
            }
            return acc;
          }, []);
        } else {
          content = data.dependencies.map((d) => d.type);
        }

        configureMethod.body = BodyTemplateModel.create({
          content,
          template: ComponentTemplates.names.DependencyItem,
          options: { ...project },
        });
      }
    }

    return file;
  }
}
