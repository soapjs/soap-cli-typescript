import prettier from "prettier";
import { extname } from "path";
import {
  ClassTemplateModel,
  ExportTemplateModel,
  FileDescriptor,
  FileTemplateModel,
  FunctionTemplateModel,
  ImportTemplateModel,
  InterfaceTemplateModel,
  MethodTemplateModel,
  ProjectDescription,
  PropTemplateModel,
  TypeTemplateModel,
} from "@soapjs/soap-cli-common";
import {
  MethodInfo,
  TypeScriptClassInfo,
  TypeScriptFileInfo,
  TypeScriptFileReader,
  TypeScriptInterfaceInfo,
  TypeScriptTypeInfo,
} from "./typescript-file-reader";
import { TemplateRegistry } from "./template-registry";
import {
  BodyTemplateBuilder,
  ClassTemplateBuilder,
  ExportTemplateBuilder,
  FunctionTemplateBuilder,
  ImportTemplateBuilder,
  InterfaceTemplateBuilder,
  MethodTemplateBuilder,
  PropTemplateBuilder,
  TypeTemplateBuilder,
} from "./template-builders";

export class TypeScriptFileModifier {
  private __updated = false;
  private __file: TypeScriptFileInfo;

  constructor(
    file: TypeScriptFileInfo,
    private project: ProjectDescription,
    private templateRegistry: TemplateRegistry
  ) {
    this.__file = TypeScriptFileInfo.clone(file);
  }

  get isUpdated() {
    return this.__updated;
  }

  public updateFileCode(line: number, column: number, code: string) {
    this.__updated = true;
    const lines = this.__file.rawCode.split("\n");
    if (column > -1) {
      const singleLine = lines[line];
      const lastOpenBraceIndex = singleLine.lastIndexOf("{");
      const lastCloseBraceIndex = singleLine.lastIndexOf("}");
      const beforeLastBraces = singleLine.substring(0, lastOpenBraceIndex + 1);
      const afterLastBraces = singleLine.substring(lastCloseBraceIndex);

      lines.splice(
        line > 0 ? line - 1 : 0,
        0,
        [beforeLastBraces, code, afterLastBraces].join("\n")
      );
    } else {
      lines.splice(line > 0 ? line - 1 : 0, 0, code);
    }
    const newCode = lines.join("\n");
    this.__file = TypeScriptFileReader.readCode(newCode);
  }

  public addImport(model: ImportTemplateModel) {
    const clone = ImportTemplateModel.create(model);
    const { project } = this;

    for (const i of this.__file.imports) {
      if (i.dflt === model.dflt) {
        return;
      }
      const toImport = [];
      model.list.forEach((item) => {
        if (i.list.includes(item) === false) {
          toImport.push(item);
        }
      });

      if (toImport.length === 0 && !model.dflt) {
        return;
      }

      clone.list = toImport;
    }

    const newImportCode = this.templateRegistry
      .get(clone.template || ImportTemplateBuilder.TemplateName)
      .build(clone, project);
    const lastImport = this.__file.imports.at(-1);

    if (lastImport) {
      this.updateFileCode(lastImport.end.line + 1, -1, newImportCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${newImportCode}\n${this.__file.rawCode}`
      );
    }
  }

  public addExport(model: ExportTemplateModel) {
    const { project } = this;
    const newExportCode = this.templateRegistry
      .get(model.template || ExportTemplateBuilder.TemplateName)
      .build(model, project);
    const lastExport = this.__file.imports.at(-1);

    if (lastExport) {
      this.updateFileCode(lastExport.end.line + 1, -1, newExportCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${newExportCode}\n${this.__file.rawCode}`
      );
    }
  }

  public addType(model: TypeTemplateModel) {
    const { project } = this;
    const newTypeCode = this.templateRegistry
      .get(model.template || TypeTemplateBuilder.TemplateName)
      .build(model, project);
    const lastType = this.__file.types.at(-1);
    const firstClass = this.__file.classes.at(0);
    const lastImport = this.__file.imports.at(-1);
    const firstFunction = this.__file.functions.at(-1);

    if (lastType) {
      this.updateFileCode(lastType.end.line + 1, -1, newTypeCode);
    } else if (lastImport) {
      this.updateFileCode(lastImport.end.line + 1, -1, newTypeCode);
    } else if (firstFunction) {
      this.updateFileCode(lastImport.start.line, -1, newTypeCode);
    } else if (firstClass) {
      this.updateFileCode(firstClass.start.line, -1, newTypeCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${this.__file.rawCode}\n${newTypeCode}`
      );
    }
  }

  public addTypeProperty(
    typeInfo: TypeScriptTypeInfo,
    model: PropTemplateModel
  ) {
    const { project } = this;
    const lastProp = typeInfo.props.at(-1);
    let startLine = -1;

    if (lastProp) {
      startLine = lastProp.end.line + 1;
    } else {
      startLine = typeInfo.start.line;
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        -1,
        this.templateRegistry
          .get(model.template || PropTemplateBuilder.TemplateName)
          .build(model, project, { elementType: "type" })
      );
    }
  }

  public addInterface(model: InterfaceTemplateModel) {
    const { project } = this;
    const newInterfaceCode = this.templateRegistry
      .get(model.template || InterfaceTemplateBuilder.TemplateName)
      .build(model, project);
    const lastInterface = this.__file.interfaces.at(-1);
    const firstClass = this.__file.classes.at(0);
    const lastImport = this.__file.imports.at(-1);

    if (lastInterface) {
      this.updateFileCode(lastInterface.end.line + 1, -1, newInterfaceCode);
    } else if (lastImport) {
      this.updateFileCode(lastImport.end.line + 1, -1, newInterfaceCode);
    } else if (firstClass) {
      this.updateFileCode(firstClass.start.line, -1, newInterfaceCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${this.__file.rawCode}\n${newInterfaceCode}`
      );
    }
  }

  public addInterfaceMethod(
    interfaceInfo: TypeScriptInterfaceInfo,
    model: MethodTemplateModel
  ) {
    const { project } = this;
    const lastMethod = interfaceInfo.methods.at(-1);
    let startLine = -1;
    let column = -1;
    if (lastMethod) {
      startLine = lastMethod.end.line + 1;
    } else if (interfaceInfo.props.length > 0) {
      startLine = interfaceInfo.props.at(-1).end.line + 1;
    } else {
      if (interfaceInfo.start.line === interfaceInfo.end.line) {
        column = interfaceInfo.start.column;
        startLine = interfaceInfo.start.line;
      } else {
        startLine = interfaceInfo.start.line + 1;
      }
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        column,
        this.templateRegistry
          .get(model.template || MethodTemplateBuilder.TemplateName)
          .build(model, project, { elementType: "interface" })
      );
    }
  }

  public addInterfaceProperty(
    interfaceInfo: TypeScriptInterfaceInfo,
    model: PropTemplateModel
  ) {
    const { project } = this;
    const lastProp = interfaceInfo.props.at(-1);
    const firstMethod = interfaceInfo.methods.at(0);
    let startLine = -1;
    let column = -1;
    if (lastProp) {
      startLine = lastProp.end.line + 1;
    } else if (firstMethod) {
      startLine = firstMethod.start.line;
    } else {
      if (interfaceInfo.start.line === interfaceInfo.end.line) {
        column = interfaceInfo.start.column;
        startLine = interfaceInfo.start.line;
      } else {
        startLine = interfaceInfo.start.line + 1;
      }
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        column,
        this.templateRegistry
          .get(model.template || PropTemplateBuilder.TemplateName)
          .build(model, project, { elementType: "interface" })
      );
    }
  }

  public addClass(model: ClassTemplateModel) {
    const { project } = this;
    this.__updated = true;
    const newClassCode = this.templateRegistry
      .get(model.template || ClassTemplateBuilder.TemplateName)
      .build(model, project);
    this.__file = TypeScriptFileReader.readCode(
      `${this.__file.rawCode}\n${newClassCode}`
    );
  }

  public addFunction(model: FunctionTemplateModel) {
    const { project } = this;
    this.__updated = true;
    const newFunctionCode = this.templateRegistry
      .get(model.template || FunctionTemplateBuilder.TemplateName)
      .build(model, project);

    const lastFunction = this.__file.functions.at(-1);
    const firstClass = this.__file.classes.at(0);
    const lastImport = this.__file.imports.at(-1);

    if (lastFunction) {
      this.updateFileCode(lastFunction.end.line + 1, -1, newFunctionCode);
    } else if (lastImport) {
      this.updateFileCode(lastImport.end.line + 1, -1, newFunctionCode);
    } else if (firstClass) {
      this.updateFileCode(firstClass.start.line, -1, newFunctionCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${this.__file.rawCode}\n${newFunctionCode}`
      );
    }
  }

  public updateClassMethod(
    classInfo: TypeScriptClassInfo,
    method: MethodInfo,
    model: MethodTemplateModel
  ) {
    const { project } = this;

    if (method.body.end.line > -1) {
      const column =
        method.body.start.line === method.body.end.line
          ? method.body.start.column
          : -1;

      this.updateFileCode(
        method.body.end.line,
        column,
        this.templateRegistry
          .get(model.body.template || BodyTemplateBuilder.TemplateName)
          .build(model.body, project, this.project)
      );
    }
  }

  public addClassMethod(
    classInfo: TypeScriptClassInfo,
    model: MethodTemplateModel
  ) {
    const { project } = this;
    const lastEqAccessMethod = classInfo.methods
      .filter((m) => {
        return (
          m.accessibility === model.access ||
          (!m.accessibility && model.access === "public")
        );
      })
      .pop();
    let startLine = -1;
    let column = -1;
    if (lastEqAccessMethod) {
      startLine = lastEqAccessMethod.end.line + 1;
    } else if (classInfo.ctor) {
      startLine = classInfo.ctor.end.line + 1;
    } else if (classInfo.props.length > 0) {
      startLine = classInfo.props.at(-1).end.line + 1;
    } else {
      if (classInfo.start.line === classInfo.end.line) {
        column = classInfo.start.column;
        startLine = classInfo.start.line;
      } else {
        startLine = classInfo.start.line + 1;
      }
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        column,
        this.templateRegistry
          .get(model.template || MethodTemplateBuilder.TemplateName)
          .build(model, project, {
            elementType: classInfo.abstract ? "abstract_class" : "class",
          })
      );
    }
  }

  public addClassProperty(
    classInfo: TypeScriptClassInfo,
    model: PropTemplateModel
  ) {
    const { project } = this;
    const lastEqAccessProp = classInfo.props
      .filter((p) => p.accessibility === model.access)
      .pop();
    let startLine = -1;
    let column = -1;
    if (lastEqAccessProp) {
      startLine = lastEqAccessProp.end.line + 2;
    } else if (classInfo.ctor) {
      startLine = classInfo.ctor.start.line;
    } else {
      if (classInfo.start.line === classInfo.end.line) {
        column = classInfo.start.column;
        startLine = classInfo.start.line;
      } else {
        startLine = classInfo.start.line + 1;
      }
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        column,
        this.templateRegistry
          .get(model.template || PropTemplateBuilder.TemplateName)
          .build(model, project, { elementType: "class" })
      );
    }
  }

  async modify(model: FileTemplateModel): Promise<FileDescriptor> {
    model.content.imports.forEach((virtual) => {
      const ep = virtual.path.replace(extname(virtual.path), "");
      if (
        this.__file.imports.findIndex((c) => {
          return c.path === ep;
        }) === -1
      ) {
        this.addImport(virtual);
      }
    });

    model.content.exports.forEach((virtual) => {
      const ep = virtual.path.replace(extname(virtual.path), "");
      if (this.__file.exports.findIndex((c) => c.path === ep) === -1) {
        this.addExport(virtual);
      }
    });

    model.content.types.forEach((virtual) => {
      const type = this.__file.types.find((c) => c.name === virtual.name);
      if (type) {
        virtual.props.forEach((item) => {
          if (
            type.props.findIndex((m) => {
              return m.name === item.name;
            }) === -1
          ) {
            this.addTypeProperty(type, item);
          }
        });
      } else {
        this.addType(virtual);
      }
    });

    model.content.interfaces.forEach((virtual) => {
      const intf = this.__file.interfaces.find((c) => c.name === virtual.name);
      if (intf) {
        virtual.methods.forEach((item) => {
          if (intf.methods.findIndex((m) => m.name === item.name) === -1) {
            this.addInterfaceMethod(intf, item);
          }
        });
        virtual.props.forEach((item) => {
          if (intf.props.findIndex((m) => m.name === item.name) === -1) {
            this.addInterfaceProperty(intf, item);
          }
        });
      } else {
        this.addInterface(virtual);
      }
    });

    model.content.functions.forEach((virtual) => {
      if (
        this.__file.functions.findIndex((f) => f.name === virtual.name) === -1
      ) {
        this.addFunction(virtual);
      }
    });

    model.content.classes.forEach((virtual) => {
      const clss = this.__file.classes.find((c) => c.name === virtual.name);
      if (clss) {
        virtual.methods.forEach((item) => {
          const vm = clss.methods.find((m) => m.name === item.name);
          if (vm) {
            this.updateClassMethod(clss, vm, item);
          } else {
            this.addClassMethod(clss, item);
          }
        });
        virtual.props.forEach((item) => {
          if (
            clss.props.findIndex((m) => {
              return m.name === item.name;
            }) === -1
          ) {
            this.addClassProperty(clss, item);
          }
        });
      } else {
        this.addClass(virtual);
      }
    });

    return this.__updated
      ? this.exportFileDescriptor(model.path, model.write_method)
      : null;
  }

  async exportFileDescriptor(path: string, write_method: string) {
    const formattedCode = await prettier.format(this.__file.rawCode, {
      parser: "typescript",
    });
    return new FileDescriptor(path, write_method, formattedCode);
  }
}
