import {
  ExportSchemaObject,
  ExportTemplateModel,
  FileTemplateModel,
  WriteMethod,
} from "@soapjs/soap-cli-common";
import { dirname, join, relative, basename, extname } from "path";

export class IndexTemplateModelsFactory {
  private addExport(
    exports: ExportSchemaObject[],
    path: string,
    exp: ExportSchemaObject
  ) {
    if (exp) {
      const cExp = exports.find((e) => e.path === path);
      if (!cExp) {
        exports.push(
          ExportTemplateModel.create({
            ...exp,
            path,
          })
        );
      }
    }
  }

  create(models: FileTemplateModel[]): FileTemplateModel[] {
    const indexModelsByPath = new Map<string, ExportTemplateModel[]>();
    models.forEach((model) => {
      if (model.write_method === WriteMethod.Skip) {
        return;
      }

      const dir = dirname(model.path);
      const indexPath = join(dir, "index.ts");
      let temp = join(
        relative(dirname(indexPath), dirname(model.path)),
        basename(model.path).replace(extname(model.path), "")
      );

      const path = temp.startsWith(".") ? temp : `./${temp}`;

      let exports = indexModelsByPath.get(indexPath);

      if (!exports) {
        exports = [];
        indexModelsByPath.set(indexPath, exports);
      }

      model.content.classes.forEach((item) => {
        this.addExport(exports, path, item.exp);
      });

      model.content.types.forEach((item) => {
        this.addExport(exports, path, item.exp);
      });

      model.content.functions.forEach((item) => {
        this.addExport(exports, path, item.exp);
      });
    });

    return Array.from(
      indexModelsByPath,
      ([path, exports]) =>
        new FileTemplateModel(path, WriteMethod.Write, { exports })
    );
  }
}
