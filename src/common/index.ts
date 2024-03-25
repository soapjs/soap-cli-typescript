import { TemplateSchemaMap } from "@soapjs/soap-cli-common";
import {
  ArgumentTemplateBuilder,
  BodyTemplateBuilder,
  ClassTemplateBuilder,
  ConstructorTemplateBuilder,
  ExportTemplateBuilder,
  FunctionTemplateBuilder,
  GenericTemplateBuilder,
  ImportTemplateBuilder,
  InheritanceTemplateBuilder,
  InterfaceTemplateBuilder,
  ImplementedInterfaceTemplateBuilder,
  MethodTemplateBuilder,
  ParamTemplateBuilder,
  PropTemplateBuilder,
  SuperTemplateBuilder,
  TestCaseTemplateBuilder,
  TestSuiteTemplateBuilder,
  TypeTemplateBuilder,
  RouteFactoryMethodTemplateBuilder,
  TypeScriptFileTemplateBuilder,
} from "./template-builders";
import { TemplateRegistry } from "./template-registry";

export * from "./errors";
export * from "./template-builders";
export * from "./tools";
export * from "./template-model.builder";
export * from "./template-registry";
export * from "./template-service";
export * from "./typescript-file-modifier";
export * from "./typescript-file-reader";
export * from "./template-builders/basic/typescript-file.template-builder";
export * from "./strategies/typescript-file-descriptor.strategy";
export * from "./strategies/typescript-project.build-strategy";
export * from "./strategies/typescript-project.init-strategy";
export * from "./strategies/typescript-template-model.strategy";

export const setupBasicTemplates = (
  templateRegistry: TemplateRegistry,
  templateSchemas: TemplateSchemaMap
) => {
  templateRegistry.register(
    TypeScriptFileTemplateBuilder.TemplateName,
    new TypeScriptFileTemplateBuilder(),
    templateSchemas[TypeScriptFileTemplateBuilder.TemplateName]
  );

  templateRegistry.register(
    ArgumentTemplateBuilder.TemplateName,
    new ArgumentTemplateBuilder(),
    templateSchemas[ArgumentTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    BodyTemplateBuilder.TemplateName,
    new BodyTemplateBuilder(),
    templateSchemas[BodyTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    ClassTemplateBuilder.TemplateName,
    new ClassTemplateBuilder(),
    templateSchemas[ClassTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    ConstructorTemplateBuilder.TemplateName,
    new ConstructorTemplateBuilder(),
    templateSchemas[ConstructorTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    ExportTemplateBuilder.TemplateName,
    new ExportTemplateBuilder(),
    templateSchemas[ExportTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    FunctionTemplateBuilder.TemplateName,
    new FunctionTemplateBuilder(),
    templateSchemas[FunctionTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    GenericTemplateBuilder.TemplateName,
    new GenericTemplateBuilder(),
    templateSchemas[GenericTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    ImportTemplateBuilder.TemplateName,
    new ImportTemplateBuilder(),
    templateSchemas[ImportTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    InheritanceTemplateBuilder.TemplateName,
    new InheritanceTemplateBuilder(),
    templateSchemas[InheritanceTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    InterfaceTemplateBuilder.TemplateName,
    new InterfaceTemplateBuilder(),
    templateSchemas[InterfaceTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    ImplementedInterfaceTemplateBuilder.TemplateName,
    new ImplementedInterfaceTemplateBuilder(),
    templateSchemas[ImplementedInterfaceTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    MethodTemplateBuilder.TemplateName,
    new MethodTemplateBuilder(),
    templateSchemas[MethodTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    ParamTemplateBuilder.TemplateName,
    new ParamTemplateBuilder(),
    templateSchemas[ParamTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    PropTemplateBuilder.TemplateName,
    new PropTemplateBuilder(),
    templateSchemas[PropTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    SuperTemplateBuilder.TemplateName,
    new SuperTemplateBuilder(),
    templateSchemas[SuperTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    TestCaseTemplateBuilder.TemplateName,
    new TestCaseTemplateBuilder(),
    templateSchemas[TestCaseTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    TestSuiteTemplateBuilder.TemplateName,
    new TestSuiteTemplateBuilder(),
    templateSchemas[TestSuiteTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    TypeTemplateBuilder.TemplateName,
    new TypeTemplateBuilder(),
    templateSchemas[TypeTemplateBuilder.TemplateName]
  );
  templateRegistry.register(
    RouteFactoryMethodTemplateBuilder.TemplateName,
    new RouteFactoryMethodTemplateBuilder(),
    templateSchemas[RouteFactoryMethodTemplateBuilder.TemplateName]
  );
};
