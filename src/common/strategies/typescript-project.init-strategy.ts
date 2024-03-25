import { join } from "path";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import {
  Strategy,
  Texts,
  ProjectDescription,
  Result,
  PluginMap,
} from "@soapjs/soap-cli-common";
import { TemplateService, execAsync, hasDependency, installPackage } from "..";
import { DependenciesError } from "../errors";

import TSconfig from "../../config/default.tsconfig.json";
import { TemplateRegistry } from "../template-registry";

export abstract class TypeScriptProjectInitStrategy extends Strategy {
  constructor(
    protected texts: Texts,
    protected pluginMap: PluginMap,
    protected templateRegistry: TemplateRegistry
  ) {
    super();
  }

  async installModule(alias, category, modules, dependencies, failed) {
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

        if (plugin && hasDependency(dependencies, plugin) === false) {
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
    const { pluginMap } = this;
    const {
      ioc,
      database,
      web_framework,
      auth_framework,
      test_framework,
      message_broker,
      platform,
    } = project;
    const packageString = await readFile("./package.json", "utf-8");

    if (!packageString) {
      throw Error("no_package_json_detected__use_new_project_command");
    }

    const packageJson = JSON.parse(packageString);
    const dependencies = Object.keys(packageJson.dependencies);
    const tsPlugin = pluginMap.getLanguage("typescript");
    const modules = pluginMap.getAllLanguageModules("typescript");
    const { soap_modules } = tsPlugin;
    const failed = [];

    try {
      for (const module of soap_modules) {
        if (hasDependency(dependencies, module) === false) {
          await execAsync(
            `npm install ${module} --save`,
            "Installing plugin ..."
          ).catch((e) => {
            failed.push(module);
          });
        }
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
          dependencies,
          failed
        );
      }

      await this.installModule(ioc, "ioc", modules, dependencies, failed);
      await this.installModule(
        web_framework,
        "web_frameworks",
        modules,
        dependencies,
        failed
      );
      await this.installModule(
        auth_framework,
        "auth_frameworks",
        modules,
        dependencies,
        failed
      );
      await this.installModule(
        test_framework,
        "test_frameworks",
        modules,
        dependencies,
        failed
      );
      await this.installModule(
        message_broker,
        "message_brokers",
        modules,
        dependencies,
        failed
      );
      await this.installModule(
        platform,
        "platforms",
        modules,
        dependencies,
        failed
      );

      if (failed.length > 0) {
        return Result.withFailure(new DependenciesError(failed));
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async createTSconfig(type?: string) {
    try {
      await writeFile(`tsconfig.json`, JSON.stringify(TSconfig, null, 2));
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

  abstract createSource(project: ProjectDescription);

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
      console.log(chalk.green(texts.get("soap_init_complete")));
    } else {
      console.log(chalk.red(texts.get("soap_init_errors")));
    }

    return Result.withoutContent();
  }
}
