import { join } from "path";
import { existsSync } from "fs";
import { Result, ProjectDescription } from "@soapjs/soap-cli-common";
import { mkdir, writeFile } from "fs/promises";
import { execAsync } from "../../core";
import {
  DependenciesTemplate,
  LauncherTemplate,
  RouterTemplate,
} from "../../templates";
import { TypeScriptProjectBuildStrategy } from "../common/typescript-project.build-strategy";
import TSconfig from "../../config/default.tsconfig.json";

export class BasicProjectBuildStrategy extends TypeScriptProjectBuildStrategy {
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

      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
