import {
  ExportTemplateModel,
  FileTemplateModel,
  ProjectDescription,
  SourceFileTemplateModel,
  WriteMethod,
} from "@soapjs/soap-cli-common";
import { TypeScriptFileInfo, TypeScriptFileReader } from "../../common";
import { existsSync } from "fs";
import { dirname, join, relative, basename, extname } from "path";

export class ExpressIndexTemplateModelBuiler {
  private fileTemplateModels: Map<string, FileTemplateModel> = new Map();
  private fileReferences: Map<string, TypeScriptFileInfo> = new Map();

  constructor(protected project: ProjectDescription) {}

  protected getExportPath(indexPath: string, file: FileTemplateModel) {
    const tempExportedPath = join(
      relative(dirname(indexPath), dirname(file.path)),
      basename(file.path).replace(extname(file.path), "")
    );
    return tempExportedPath.startsWith(".")
      ? tempExportedPath
      : `./${tempExportedPath}`;
  }

  add(file: FileTemplateModel) {
    if (file.write_method === WriteMethod.Skip) {
      return;
    }
    const indexPath = join(dirname(file.path), "index.ts");

    let indexFileReference = this.fileReferences.get(indexPath);
    let indexFileModel = this.fileTemplateModels.get(indexPath);

    if (indexFileReference === undefined) {
      if (existsSync(indexPath)) {
        indexFileReference = TypeScriptFileReader.readFile(indexPath);
        this.fileReferences.set(indexPath, indexFileReference);
      } else {
        this.fileReferences.set(indexPath, null);
      }
    }

    if (!indexFileModel) {
      indexFileModel = indexFileModel = new SourceFileTemplateModel(
        indexPath,
        WriteMethod.Write
      );
      this.fileTemplateModels.set(indexPath, indexFileModel);
    }

    const exportPath = this.getExportPath(indexPath, file);
    const referenceContainsExport =
      indexFileReference &&
      indexFileReference.exports.findIndex((e) => e.path === exportPath) > -1;
    const modelContainsExport =
      indexFileModel.content.exports.findIndex((e) => e.path === exportPath) >
      -1;

    if (!referenceContainsExport && !modelContainsExport) {
      indexFileModel.content.exports.push(
        ExportTemplateModel.create({
          use_wildcard: true,
          path: exportPath,
        })
      );
    }
  }

  build(): FileTemplateModel[] {
    return Array.from(this.fileTemplateModels, ([, value]) => value);
  }
}
