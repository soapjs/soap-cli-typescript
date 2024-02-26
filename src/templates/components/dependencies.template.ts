import { ProjectDescription, TypeInfoObject } from "@soapjs/soap-cli-common";

export const DEPENDENCIES_TEMPLATE = `
__IMPORTS__

export class Dependencies {
  public configure(__ARGS__) {

  }
}
`;

export class DependenciesTemplate {
  static parse(model: { ioc: string }, project: ProjectDescription): string {
    let __IMPORTS__ = "";
    let __ARGS__ = "";

    if (model.ioc === "inversify") {
      __IMPORTS__ = `import { Container } from 'inversify';`;
      __ARGS__ = "container: Container";
    } else if (model.ioc === "singleton") {
      __IMPORTS__ = `import { Singleton } from '@soapjs/soap';`;
    }

    return DEPENDENCIES_TEMPLATE.replace("__IMPORTS__", __IMPORTS__)
      .replace("__ARGS__", __ARGS__)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}

export const INVERSIFY_CLASS_DEPENDENCY_TEMPLATE = `  container.bind<__CLASS__>(__TOKEN__).to(__CLASS__);`;
export const INVERSIFY_INSTANCE_DEPENDENCY_TEMPLATE = `  container.bind<__CLASS__>(__TOKEN__).toConstantValue(__INSTANCE__);`;
export const SINGLETON_CLASS_DEPENDENCY_TEMPLATE = `  Singleton.bind(__TOKEN__, __CLASS__);`;
export const SINGLETON_INSTANCE_DEPENDENCY_TEMPLATE = `  Singleton.bind(__TOKEN__, __INSTANCE__);`;

export class DependencyItemTemplateFactory {
  static parse(
    model: {
      content: TypeInfoObject[];
      options: { ioc: string; type: TypeInfoObject };
    },
    project: ProjectDescription
  ) {
    return model.content
      .map((component) => {
        if (component.isRepository) {
          //
        }
        // ----
        if (
          component.isController ||
          component.isUseCase ||
          component.isToolset
        ) {
          if (model.options.ioc === "inversify") {
            return INVERSIFY_CLASS_DEPENDENCY_TEMPLATE.replace(
              /__CLASS__/g,
              component.name
            ).replace(/__TOKEN__/g, `${component.name}.Token`);
          }

          if (model.options.ioc === "singleton") {
            return SINGLETON_CLASS_DEPENDENCY_TEMPLATE.replace(
              /__CLASS__/g,
              component.name
            ).replace(/__TOKEN__/g, `${component.name}.Token`);
          }
        }

        return "";
      })
      .join("\n");
  }
}
