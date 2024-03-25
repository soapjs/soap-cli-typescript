import {
  Strategy,
  Texts,
  Result,
  ProjectDescription,
  PluginMap,
  workerLog,
} from "@soapjs/soap-cli-common";
import chalk from "chalk";
import { DependenciesError } from "../errors";
import { TemplateService, execAsync, installPackage } from "..";

import TSconfig from "../../config/default.tsconfig.json";
import { copyFile, readdir, writeFile } from "fs/promises";
import { TemplateRegistry } from "../template-registry";
import { extname, join } from "path";

export abstract class TypeScriptProjectBuildStrategy extends Strategy {
  constructor(
    protected texts: Texts,
    protected pluginMap: PluginMap,
    protected templateRegistry: TemplateRegistry
  ) {
    super();
  }

  abstract initProject(project: ProjectDescription);
  abstract createSource(project: ProjectDescription);

  async createTSconfig(type?: string) {
    try {
      await writeFile(`tsconfig.json`, JSON.stringify(TSconfig, null, 2));
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async installModule(alias, category, modules, failed) {
    if (alias) {
      const module = modules[category].find((i) => i.alias === alias);
      if (module) {
        const pckgs = Array.isArray(module.packages?.typescript)
          ? module.packages?.typescript
          : [];
        const plugin = Array.isArray(module.soap_modules?.typescript)
          ? module.soap_modules.typescript
          : null;

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
          this.texts.get(`no_config_found_for_#`).replace("#", alias)
        );
      }
    }
  }

  async installDependencies(project: ProjectDescription) {
    const {
      ioc,
      database,
      web_framework,
      auth_framework,
      test_framework,
      message_broker,
      platform,
    } = project;
    const { pluginMap } = this;
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
      const modules = pluginMap.getAllLanguageModules("typescript");
      const { packages, soap_modules } = tsPlugin;

      for (const module of soap_modules) {
        await execAsync(
          `npm install ${module} --save`,
          "Installing plugin ..."
        ).catch((e) => {
          failed.push(module);
        });
      }

      for (const pckg of packages) {
        await installPackage(pckg).catch((e) => {
          failed.push(pckg);
        });
      }

      for (const db of database) {
        const dblc = db.toLowerCase();

        if (dblc === "cache" || dblc === "none" || dblc === "memory") {
          continue;
        }

        await this.installModule(
          pluginMap.getDatabase({ alias: dblc }).alias,
          "databases",
          modules,
          failed
        );
      }

      await this.installModule(ioc, "ioc", modules, failed);
      await this.installModule(
        web_framework,
        "web_frameworks",
        modules,
        failed
      );
      await this.installModule(
        auth_framework,
        "auth_frameworks",
        modules,
        failed
      );
      await this.installModule(
        test_framework,
        "test_frameworks",
        modules,
        failed
      );
      await this.installModule(
        message_broker,
        "message_brokers",
        modules,
        failed
      );
      await this.installModule(platform, "platforms", modules, failed);

      if (failed.length > 0) {
        return Result.withFailure(new DependenciesError(failed));
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async createTemplates(project: ProjectDescription) {
    const source = join(__dirname, `../../../templates`);
    const target = join(process.cwd(), `.soap/templates`);
    const transfers = {
      [join(source, "basic")]: join(target, "basic"),
      [join(source, project.web_framework)]: join(
        target,
        project.web_framework
      ),
    };

    return TemplateService.copyTemplates(transfers);
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

    const templatesResult = await this.createTemplates(project);

    if (templatesResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`create_templates_#`)));
      console.log(chalk.gray(templatesResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`create_templates_#`)));
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
