import { join } from "path";
import chalk from "chalk";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import {
  Strategy,
  Texts,
  ProjectDescription,
  Result,
  PluginMap,
} from "@soapjs/soap-cli-common";
import { execAsync, hasDependency, installPackage } from "../../core";

import TSconfig from "../../config/default.tsconfig.json";
import {
  DependenciesTemplate,
  LauncherTemplate,
  RouterTemplate,
} from "../../templates";
import { DependenciesError } from "./errors";

export abstract class TypeScriptProjectInitStrategy extends Strategy {
  constructor(
    private texts: Texts,
    private pluginMap: PluginMap
  ) {
    super();
  }

  async installDependencies(project: ProjectDescription) {
    const { pluginMap, texts } = this;
    const { database, web_framework, ioc } = project;
    const packageString = await readFile("./package.json", "utf-8");

    if (!packageString) {
      throw Error("no_package_json_detected__use_new_project_command");
    }

    const packageJson = JSON.parse(packageString);
    const dependencies = Object.keys(packageJson.dependencies);
    const tsPlugin = pluginMap.getLanguage("typescript");
    const { plugin } = tsPlugin;
    const failed = [];

    try {
      if (hasDependency(dependencies, plugin) === false) {
        await execAsync(
          `npm install ${plugin} --save`,
          `Installing ${plugin} ...`
        ).catch((e) => {
          failed.push(plugin);
        });
      }

      for (const db of database) {
        const dblc = db.toLowerCase();
        const dbConfig = pluginMap.getDatabase(dblc);
        if (dbConfig) {
          const { packages, plugins } = dbConfig;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await installPackage(pckg, dependencies).catch((e) =>
              failed.push(pckg)
            );
          }

          if (plugin && hasDependency(dependencies, plugin) === false) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => failed.push(plugin));
          }
        } else {
          console.log(texts.get(`no_config_found_for_#`).replace("#", db));
        }
      }

      if (ioc) {
        const ldi = tsPlugin.ioc.find((d) => d.alias === ioc);

        if (Array.isArray(ldi.packages)) {
          for (const pckg of ldi.packages) {
            await installPackage(pckg, dependencies).catch((e) => {
              failed.push(pckg);
            });
          }
        }
      }

      if (web_framework) {
        const framework = pluginMap.getWebFramework(web_framework);
        if (framework) {
          const { packages, plugins } = framework;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await installPackage(pckg, dependencies).catch((e) =>
              failed.push(pckg)
            );
          }

          if (plugin && hasDependency(dependencies, plugin) === false) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => failed.push(plugin));
          }
        } else {
          console.log(
            texts.get(`no_config_found_for_#`).replace("#", framework.name)
          );
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

  async createTSconfig() {
    try {
      await writeFile("tsconfig.json", JSON.stringify(TSconfig, null, 2));
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async createSource(project: ProjectDescription) {
    const { source, web_framework, ioc } = project;
    try {
      if (source) {
        const srcPath = join(process.cwd(), source);

        if (existsSync(srcPath) === false) {
          mkdir(srcPath, { recursive: true });
        }

        const launcherTemplate = LauncherTemplate.parse(
          {
            web_framework,
            ioc,
          },
          project
        );
        await writeFile(join(srcPath, "index.ts"), launcherTemplate);

        const routesTemplate = RouterTemplate.parse(
          {
            ioc,
          },
          project
        );
        await writeFile(join(srcPath, "routes.ts"), routesTemplate);

        const dependenciesTemplate = DependenciesTemplate.parse(
          {
            ioc,
          },
          project
        );
        await writeFile(join(srcPath, "dependencies.ts"), dependenciesTemplate);
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async apply(project: ProjectDescription): Promise<Result> {
    const { texts } = this;
    let success = true;

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
      console.log(chalk.green(texts.get("soap_init_complete")));
    } else {
      console.log(chalk.red(texts.get("soap_init_errors")));
    }

    return Result.withoutContent();
  }
}
