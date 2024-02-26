import { TypeScriptFileTemplate } from "../../core/typescript.file-template";
import { TypeScriptFileReader } from "../../core/typescript.file-reader";
import { TypeScriptFileModifier } from "../../core/typescript.file-modifier";
import {
  Strategy,
  FileOutput,
  FileTemplateModel,
  Result,
  fileOrDirExists,
  ProjectDescription,
} from "@soapjs/soap-cli-common";

export class TypeScriptFileOutputStrategy extends Strategy {
  public async apply(
    models: FileTemplateModel[],
    project: ProjectDescription
  ): Promise<Result<FileOutput[]>> {
    const outputs: FileOutput[] = [];
    try {
      for (const model of models) {
        if (fileOrDirExists(model.path)) {
          const file = TypeScriptFileReader.readFile(model.path);
          const modifier = new TypeScriptFileModifier(file, project);
          const output = await modifier.modify(model);
          if (output) {
            outputs.push(output);
          }
        } else {
          const content = await TypeScriptFileTemplate.parse(
            model.content,
            project
          );
          const output = new FileOutput(
            model.path,
            model.write_method,
            content
          );
          outputs.push(output);
        }
      }

      return Result.withContent(outputs);
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
