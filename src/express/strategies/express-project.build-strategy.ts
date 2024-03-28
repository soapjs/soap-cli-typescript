import { join } from "path";
import { existsSync } from "fs";
import { Result, ProjectDescription } from "@soapjs/soap-cli-common";
import { mkdir, writeFile } from "fs/promises";
import { TemplateService, execAsync } from "../../common";

import { TypeScriptProjectBuildStrategy } from "../../common/strategies/typescript-project.build-strategy";
import { ExpressLauncherTemplateBuilder } from "../template-builders/express-launcher.template-builder";
import { ExpressRouterTemplateBuilder } from "../template-builders/express-router.template-builder";
import { ExpressDependenciesTemplate } from "../template-builders/express-dependencies.template-builder";
import { ExpressConfigTemplateBuilder } from "../template-builders/express-config.template-builder";

export class ExpressProjectBuildStrategy extends TypeScriptProjectBuildStrategy {
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
    return super.createTSconfig("default");
  }

  async createSource(project: ProjectDescription) {
    try {
      const srcPath = join(process.cwd(), project.source_dir || "src");
      if (existsSync(srcPath) === false) {
        await mkdir(srcPath, { recursive: true });
      }

      const templatesPath = join(process.cwd(), `.soap/templates`);
      const { content, failure } = await TemplateService.fetch([
        join(templatesPath, "basic"),
        join(templatesPath, project.web_framework),
      ]);

      if (failure) {
        return Result.withFailure(failure);
      }

      await writeFile(
        join(srcPath, "index.ts"),
        new ExpressLauncherTemplateBuilder()
          .useTemplate(content[ExpressLauncherTemplateBuilder.TemplateName])
          .build(project)
      );
      await writeFile(
        join(srcPath, "config.ts"),
        new ExpressConfigTemplateBuilder()
          .useTemplate(content[ExpressConfigTemplateBuilder.TemplateName])
          .build()
      );
      await writeFile(
        join(srcPath, "router.ts"),
        new ExpressRouterTemplateBuilder()
          .useTemplate(content[ExpressRouterTemplateBuilder.TemplateName])
          .build(project)
      );
      await writeFile(
        join(srcPath, "dependencies.ts"),
        new ExpressDependenciesTemplate()
          .useTemplate(content[ExpressDependenciesTemplate.TemplateName])
          .build(project)
      );

      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
