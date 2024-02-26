import {
  Strategy,
  Texts,
  Result,
  ProjectDescription,
  PluginMap,
} from "@soapjs/soap-cli-common";
import chalk from "chalk";
import { DependenciesError } from "./errors";
import { execAsync, installPackage } from "../../core";

export abstract class TypeScriptProjectBuildStrategy extends Strategy {
  constructor(protected texts: Texts, protected pluginMap: PluginMap) {
    super();
  }

  abstract initProject(project: ProjectDescription);

  abstract createTSconfig();

  abstract createSource(project: ProjectDescription);

  async installDependencies(project: ProjectDescription) {
    const { ioc, database, web_framework } = project;
    const { pluginMap, texts } = this;
    const failed = [];
    try {
      await execAsync(
        "npm install typescript --save",
        "Installing typescript ..."
      ).catch((e) => {
        failed.push("typescript");
      });
      await execAsync(
        "npm install @types/node --save-dev",
        "Installing @types/node ..."
      ).catch((e) => {
        failed.push("@types/node");
      });
      const tsPlugin = pluginMap.getLanguage("typescript");
      const { packages } = tsPlugin;

      for (const pckg of packages) {
        await installPackage(pckg).catch((e) => {
          failed.push(pckg);
        });
      }

      for (const db of database) {
        const dblc = db.toLowerCase();

        if (dblc === "cache" || dblc === "none") {
          continue;
        }

        const dbConfig = pluginMap.getDatabase(dblc);

        if (dbConfig) {
          const { packages, plugins } = dbConfig;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }

          if (plugin) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => {
              failed.push(plugin);
            });
          }
        } else {
          console.log(
            chalk.whiteBright(
              texts.get(`no_config_found_for_#`).replace("#", db)
            )
          );
        }
      }
      if (web_framework) {
        const framework = pluginMap.getWebFramework(web_framework);
        if (framework) {
          const pckgs = framework.packages["typescript"];
          const plugin = framework.plugins["typescript"];

          for (const pckg of pckgs) {
            await installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }

          if (plugin) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => {
              failed.push(plugin);
            });
          }
        } else {
          console.log(
            texts.get(`no_config_found_for_#`).replace("#", framework.name)
          );
        }
      }

      if (ioc) {
        const ldi = tsPlugin.ioc.find((d) => d.alias === ioc);

        if (Array.isArray(ldi.packages)) {
          for (const pckg of ldi.packages) {
            await installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }
        }
      }
      if (failed.length > 0) {
        return Result.withFailure(new DependenciesError(failed));
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async apply(project: ProjectDescription): Promise<Result> {
    const { texts } = this;
    let success = true;

    const initResult = await this.initProject(project);

    if (initResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`init_node_project_#`)));
      console.log(chalk.gray(initResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`init_node_project_#`)));
    }

    const dependenciesResult = await this.installDependencies(project);

    if (dependenciesResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`install_dependencies_#`)));
      if (dependenciesResult.failure.error instanceof DependenciesError) {
        console.log(chalk.red("Failed:"));
        console.log(
          chalk.gray(
            " - " + dependenciesResult.failure.error.list.join("\n - ")
          )
        );
      } else {
        console.log(chalk.gray(dependenciesResult.failure.error.message));
      }
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`install_dependencies_#`)));
    }

    const tsConfigResult = await this.createTSconfig();

    if (tsConfigResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`create_tsconfig_#`)));
      console.log(chalk.gray(tsConfigResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`create_tsconfig_#`)));
    }

    const sourceResult = await this.createSource(project);

    if (sourceResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`create_source_#`)));
      console.log(chalk.gray(sourceResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`create_source_#`)));
    }

    if (success) {
      console.log(chalk.green(texts.get("project_setup_complete")));
    } else {
      console.log(chalk.red(texts.get("project_setup_errors")));
    }

    return Result.withoutContent();
  }
}
