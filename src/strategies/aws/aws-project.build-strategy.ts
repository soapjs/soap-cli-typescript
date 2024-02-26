import { join } from "path";
import { existsSync } from "fs";
import { Result, ProjectDescription } from "@soapjs/soap-cli-common";
import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import { execAsync, installPackage } from "../../core";

import TSconfig from "../../config/default.tsconfig.json";
import {
  DependenciesTemplate,
  LauncherTemplate,
  RouterTemplate,
} from "../../templates";
import { DependenciesError } from "../common/errors";
import { TypeScriptProjectBuildStrategy } from "../common/typescript-project.build-strategy";

export class AwsProjectBuildStrategy extends TypeScriptProjectBuildStrategy {
  async initProject(project: ProjectDescription) {
    const { description, author, license, name } = project;
    try {
      const packageJson = {
        name,
        version: "0.0.0",
        description: description || "",
        main: `build/index.js`,
        scripts: {
          clean: "rm -rf ./build",
          build: "yarn clean && tsc",
          start: "node build/index.js",
          test: 'echo "Error: no test specified" && exit 1',
        },
        author: author || "",
        license: license || "ISC",
      };

      await writeFile("package.json", JSON.stringify(packageJson, null, 2));
      await execAsync("npm init -y");
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
      const srcPath = join(process.cwd(), source || "src");
      const apiPath = join(process.cwd(), source || "api");

      if (existsSync(srcPath) === false) {
        mkdir(srcPath, { recursive: true });
      }

      if (existsSync(apiPath) === false) {
        mkdir(apiPath, { recursive: true });
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

      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
