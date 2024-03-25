import prettier from "prettier";
import { TypeScriptFileTemplateBuilder } from "../template-builders";
import { TypeScriptFileReader } from "../typescript-file-reader";
import { TypeScriptFileModifier } from "../typescript-file-modifier";
import {
  Strategy,
  FileDescriptor,
  FileTemplateModel,
  Result,
  fileOrDirExists,
  ProjectDescription,
  isSourceCodeModel,
  workerLog,
} from "@soapjs/soap-cli-common";
import { TemplateRegistry } from "../template-registry";

export class TypeScriptFileDescriptorStrategy extends Strategy {
  constructor(protected templateRegistry: TemplateRegistry) {
    super();
  }
  public async apply(
    models: FileTemplateModel[],
    project: ProjectDescription
  ): Promise<Result<FileDescriptor[]>> {
    const { templateRegistry } = this;
    const outputs: FileDescriptor[] = [];

    try {
      for (const model of models) {
        if (isSourceCodeModel(model)) {
          if (fileOrDirExists(model.path)) {
            const file = TypeScriptFileReader.readFile(model.path);
            const modifier = new TypeScriptFileModifier(
              file,
              project,
              templateRegistry
            );

            const output = await modifier.modify(model);
            if (output) {
              outputs.push(output);
            }
          } else {
            const content = await templateRegistry
              .get<TypeScriptFileTemplateBuilder>(
                TypeScriptFileTemplateBuilder.TemplateName
              )
              .build(model.content, project);
            const formatted = await prettier.format(content, {
              parser: "typescript",
            });
            const output = new FileDescriptor(
              model.path,
              model.write_method,
              formatted
            );
            outputs.push(output);
          }
        } else {
          const output = new FileDescriptor(
            model.path,
            model.write_method,
            model.content
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
