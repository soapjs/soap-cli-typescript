import {
  BodyTemplateModel,
  ComponentData,
  FileTemplateModel,
  ProjectDescription,
} from "@soapjs/soap-cli-common";
import {
  RouterTemplateModelFactory,
  TypeScriptFileInfo,
  TypeScriptFileReader,
} from "../../core";
import { existsSync } from "fs";
import { ComponentTemplates } from "../../templates";

export class BasicRouterTemplateModelFactory extends RouterTemplateModelFactory {
  create(
    data: ComponentData,
    project: ProjectDescription
  ): FileTemplateModel {
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
        let routes;
        if (ref) {
          routes = data.addons["routes"].map((route) => {
            const { controller } = route;
            const options = {};
            const controllerImport = ref.imports.find(
              (i) => i.dflt === controller || i.list.includes(controller)
            );

            if (controllerImport) {
              options["skipConrollerResolver"] = true;
            }
            return { ...route, options };
          });
        } else {
          routes = data.addons["routes"];
        }

        configureMethod.body = BodyTemplateModel.create({
          content: routes,
          template: ComponentTemplates.names.RouterItem,
          options: { ...project },
        });
      }
    }

    return file;
  }
}
