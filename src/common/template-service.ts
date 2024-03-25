import { Result, TemplateSchemaMap } from "@soapjs/soap-cli-common";
import { existsSync } from "fs";
import { copyFile, readFile, readdir, mkdir } from "fs/promises";
import { extname, join } from "path";

export class TemplateService {
  static async fetch(sources: string[]): Promise<Result<TemplateSchemaMap>> {
    try {
      let readPromises = [];
      const templates = {};
      for (const sourceDir of sources) {
        if (!existsSync(sourceDir)) {
          continue;
        }

        const files = await readdir(sourceDir);
        const sourcePromises = files
          .filter((file) => extname(file) === ".hbs")
          .map(async (file) => {
            const sourcePath = join(sourceDir, file);
            const source = await readFile(sourcePath, "utf-8");
            templates[file.replace(".template.hbs", "")] = source;
          });

        readPromises = readPromises.concat(sourcePromises);
      }

      await Promise.all(readPromises);
      return Result.withContent(templates);
    } catch (error) {
      console.error(
        "Error reading Handlebars files from multiple sources:",
        error
      );
      Result.withFailure(error);
    }
  }

  static async copyTemplates(transfers: {
    [source: string]: string;
  }): Promise<Result<void>> {
    try {
      let copyPromises = [];
      const sources = Object.keys(transfers);

      for (const source of sources) {
        const target = transfers[source];
        const files = await readdir(source);

        if (!existsSync(target)) {
          await mkdir(target, { recursive: true });
        }

        const sourcePromises = files
          .filter((file) => extname(file) === ".hbs")
          .map(async (file) => {
            const sourcePath = join(source, file);
            const targetPath = join(target, file);
            await copyFile(sourcePath, targetPath);
            // console.log(`Copied ${file} from ${source} to ${target}`);
          });
        copyPromises = copyPromises.concat(sourcePromises);
      }
      await Promise.all(copyPromises);
      return Result.withoutContent();
    } catch (error) {
      console.error(
        "Error copy Handlebars files from multiple sources:",
        error
      );
      Result.withFailure(error);
    }
  }
}
