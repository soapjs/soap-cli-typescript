import { mkdir, writeFile } from "fs/promises";
import { TypeScriptProjectInitStrategy } from "../../common/strategies/typescript-project.init-strategy";
import { ProjectDescription, Result } from "@soapjs/soap-cli-common";
import { existsSync } from "fs";
import { join } from "path";
import { ExpressLauncherTemplateBuilder } from "../templates/express-launcher.template-builder";
import { ExpressRouterTemplateBuilder } from "../templates/express-router.template";
import { ExpressDependenciesTemplate } from "../templates/express-dependencies.template-builder";
import { ExpressConfigTemplateBuilder } from "../templates/express-config.template-builder";
import { TemplateService } from "../../common";

export class ExpressProjectInitStrategy extends TypeScriptProjectInitStrategy {
  async createTSconfig() {
    return super.createTSconfig("default");
  }

  async createSource(project: ProjectDescription) {
    const { source_dir } = project;
    try {
      if (source_dir) {
        const srcPath = join(process.cwd(), source_dir);

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
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
