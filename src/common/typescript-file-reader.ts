import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { workerLog } from "@soapjs/soap-cli-common";
import { readFileSync } from "fs";

export type PropertyInfo = {
  name: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  optional?: boolean;
  static?: boolean;
  readonly?: boolean;
  accessibility?: string;
  value?: any;
};

export type ParameterInfo = {
  name: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  optional?: boolean;
  readonly?: boolean;
  accessibility?: string;
  value?: any;
};

export type MethodInfo = {
  name: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  optional?: boolean;
  accessibility?: string;
  abstract?: boolean;
  static?: boolean;
  kind?: string;
  params: ParameterInfo[];
  body: CodeBlockInfo;
};

export type TypeScriptTypeInfo = {
  name: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  props: PropertyInfo[];
};

export type CodeBlockInfo = {
  start: { line: number; column: number };
  end: { line: number; column: number };
};

export type TypeScriptClassInfo = {
  name: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  abstract: boolean;
  ctor: MethodInfo;
  methods: MethodInfo[];
  props: PropertyInfo[];
  body: CodeBlockInfo;
};

export type TypeScriptFunctionInfo = {
  start: { line: number; column: number };
  end: { line: number; column: number };
  arrow: boolean;
  async: boolean;
  name: string;
  body: CodeBlockInfo;
  params: ParameterInfo[];
};

export type TypeScriptImportInfo = {
  path: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  dflt?: string;
  list?: string[];
};

export type TypeScriptExportInfo = {
  path: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  dflt?: string;
  list?: string[];
  use_wildcard?: boolean;
};

export type TypeScriptInterfaceInfo = {
  name: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  methods: MethodInfo[];
  props: PropertyInfo[];
};

export class TypeScriptFileInfo {
  public static clone(info: TypeScriptFileInfo) {
    const file = new TypeScriptFileInfo(info.rawCode);

    info.classes.forEach((i) => {
      file.classes.push({ ...i });
    });
    info.exports.forEach((i) => {
      file.exports.push({ ...i });
    });
    info.functions.forEach((i) => {
      file.functions.push({ ...i });
    });
    info.imports.forEach((i) => {
      file.imports.push({ ...i });
    });
    info.interfaces.forEach((i) => {
      file.interfaces.push({ ...i });
    });
    info.types.forEach((i) => {
      file.types.push({ ...i });
    });

    return file;
  }

  public readonly classes: TypeScriptClassInfo[] = [];
  public readonly types: TypeScriptTypeInfo[] = [];
  public readonly interfaces: TypeScriptInterfaceInfo[] = [];
  public readonly functions: TypeScriptFunctionInfo[] = [];
  public readonly imports: TypeScriptImportInfo[] = [];
  public readonly exports: TypeScriptExportInfo[] = [];

  private __code: string;

  constructor(code: string) {
    this.__code = code;
  }

  public get rawCode() {
    return this.__code;
  }
}

export const createPropInfo = (item: any): PropertyInfo => {
  return {
    name: item.key.name,
    value: item.value,
    start: item.loc.start,
    end: item.loc.end,
    accessibility: item.accessibility || "",
    static: !!item.static,
    optional: !!item.optional,
    readonly: !!item.readonly,
  };
};

export const createParamInfo = (item: any): ParameterInfo => {
  const param = {
    name: item.name || item.parameter?.left?.name,
    value: item.parameter?.right?.value,
    start: item.loc.start,
    end: item.loc.end,
    accessibility: item.accessibility || "",
    static: !!item.static,
    readonly: !!item.readonly,
    optional: !!item.optional,
  };

  return param;
};

export const createMethodInfo = (item: any): MethodInfo => {
  const mth = {
    name: item.key.name,
    kind: item.kind,
    column: item.loc.start.column,
    start: item.loc.start,
    end: item.loc.end,
    accessibility: item.accessibility || "",
    static: !!item.static,
    abstract: !!item.abstract,
    optional: !!item.optional,
    params: [],
    body: {
      start: item.body.loc.start,
      end: item.body.loc.end,
    },
  };

  if (Array.isArray(item.params)) {
    mth.params = item.params.map((i) => createParamInfo(i));
  }

  return mth;
};

export class TypeScriptFileReader {
  static readCode(code: string) {
    const file = new TypeScriptFileInfo(code);
    try {
      const ast = parse(file.rawCode, {
        sourceType: "module",
        plugins: ["typescript", "decorators"],
        strictMode: false,
        errorRecovery: true,
        attachComment: true,
      });

      traverse(ast, {
        FunctionDeclaration(path) {
          try {
            const { node } = path;
            const fn: TypeScriptFunctionInfo = {
              name: node.id.name,
              start: node.loc.start,
              end: node.loc.end,
              async: node.async,
              arrow: false,
              body: {
                start: node.body.loc.start,
                end: node.body.loc.end,
              },
              params: [],
            };

            if (Array.isArray(node.params)) {
              node.params.forEach((item) => {
                fn.params.push(createParamInfo(item));
              });
            }

            file.functions.push(fn);
          } catch (e) {
            console.log(e);
          }
        },
        ArrowFunctionExpression(path) {
          try {
            const { node } = path;
            if (
              path.parent.type === "VariableDeclarator" &&
              path.parent.id.type === "Identifier"
            ) {
              const fn: TypeScriptFunctionInfo = {
                name: path.parent.id.name,
                start: node.loc.start,
                end: node.loc.end,
                async: node.async,
                arrow: false,
                body: {
                  start: node.body.loc.start,
                  end: node.body.loc.end,
                },
                params: [],
              };

              if (Array.isArray(node.params)) {
                node.params.forEach((item) => {
                  fn.params.push(createParamInfo(item));
                });
              }

              file.functions.push(fn);
            }
          } catch (e) {
            console.log(e);
          }
        },
        ImportDeclaration(path) {
          try {
            const { node } = path;
            const impt: TypeScriptImportInfo = {
              path: node.source.value,
              start: node.loc.start,
              end: node.loc.end,
              dflt: null,
              list: [],
            };

            if (Array.isArray(node.specifiers)) {
              node.specifiers.forEach((item) => {
                if (item.type === "ImportDefaultSpecifier") {
                  impt.dflt = item.local.name;
                } else if (item.type === "ImportSpecifier") {
                  impt.list.push(item.local.name);
                }
              });
            }

            file.imports.push(impt);
          } catch (e) {
            console.log(e);
          }
        },
        ExportAllDeclaration(path) {
          try {
            const { node } = path;
            const exp: TypeScriptExportInfo = {
              path: node.source.value,
              start: node.loc.start,
              end: node.loc.end,
              dflt: null,
              list: [],
              use_wildcard: true,
            };

            file.exports.push(exp);
          } catch (e) {
            console.log(e);
          }
        },
        ClassDeclaration(path) {
          try {
            const { node } = path;
            const cls: TypeScriptClassInfo = {
              ctor: null,
              name: node.id.name,
              start: node.loc.start,
              end: node.loc.end,
              abstract: node.abstract,
              body: {
                start: node.body.loc.start,
                end: node.body.loc.end,
              },
              props: [],
              methods: [],
            };

            if (Array.isArray(node.body?.body)) {
              node.body.body.forEach((item) => {
                if (item.type === "ClassProperty") {
                  cls.props.push(createPropInfo(item));
                } else if (
                  item.type === "ClassMethod" ||
                  item.type === "TSDeclareMethod"
                ) {
                  if (item.kind === "constructor") {
                    cls.ctor = createMethodInfo(item);
                  } else if (item.kind === "method") {
                    cls.methods.push(createMethodInfo(item));
                  }
                }
              });
            }

            file.classes.push(cls);
          } catch (e) {
            console.log(e);
          }
        },
        TSTypeAliasDeclaration(path) {
          try {
            const { node } = path;
            const tp: TypeScriptTypeInfo = {
              name: node.id.name,
              start: node.loc.start,
              end: node.loc.end,
              props: [],
            };

            if (Array.isArray(node.typeAnnotation?.members)) {
              node.typeAnnotation.members.forEach((item) => {
                if (item.type === "TSPropertySignature") {
                  tp.props.push(createPropInfo(item));
                }
              });
            }

            file.types.push(tp);
          } catch (e) {
            console.log(e);
          }
        },
        TSInterfaceDeclaration(path) {
          try {
            const { node } = path;
            const intf: TypeScriptInterfaceInfo = {
              name: node.id.name,
              start: node.loc.start,
              end: node.loc.end,
              props: [],
              methods: [],
            };

            if (Array.isArray(node.typeAnnotation?.members)) {
              node.typeAnnotation.members.forEach((item) => {
                if (item.type === "TSPropertySignature") {
                  intf.props.push(createPropInfo(item));
                } else if (item.type === "TSMethodSignature") {
                  intf.methods.push(createMethodInfo(item));
                }
              });
            }

            file.interfaces.push(intf);
          } catch (e) {
            console.log(e);
          }
        },
      });

      return file;
    } catch (error) {
      workerLog("---faulty source code---");
      workerLog(file.rawCode);
      workerLog("--- ^ ---");
      throw error;
    }
  }

  static readFile(path: string): TypeScriptFileInfo {
    const code = readFileSync(path, "utf-8").replace(/{\s*}/g, "{\n}");
    return this.readCode(code);
  }
}
