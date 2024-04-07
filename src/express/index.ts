import { TemplateSchemaMap } from "@soapjs/soap-cli-common";
import { TemplateRegistry } from "../common";
import { ExpressConfigTemplateBuilder } from "./template-builders/express-config.template-builder";
import { ExpressDependencyBindTemplateBuilder } from "./template-builders/express-dependency-bind.template-builder";
import { ExpressRouteBindTemplateBuilder } from "./template-builders/express-route-bind.template-builder";
import { ExpressRouteFactoryMethodTemplateBuilder } from "./template-builders/express-route-factory-method.template-builder";

export * from "./template-model-builders/express.template-model.builder";
export * from "./strategies/express-project.build-strategy";
export * from "./strategies/express-project.init-strategy";
export * from "./template-builders/express-config.template-builder";
export * from "./template-builders/express-dependencies.template-builder";
export * from "./template-builders/express-dependency-bind.template-builder";
export * from "./template-builders/express-launcher.template-builder";
export * from "./template-builders/express-route-bind.template-builder";
export * from "./template-builders/express-route-factory-method.template-builder";
export * from "./template-builders/express-router.template-builder";

export const setupExpressTemplates = (
  templateRegistry: TemplateRegistry,
  templateSchemas: TemplateSchemaMap
) => {
  templateRegistry.register(
    ExpressConfigTemplateBuilder.TemplateName,
    new ExpressConfigTemplateBuilder(),
    templateSchemas[ExpressConfigTemplateBuilder.TemplateName]
  );

  templateRegistry.register(
    ExpressDependencyBindTemplateBuilder.TemplateName,
    new ExpressDependencyBindTemplateBuilder(),
    templateSchemas[ExpressDependencyBindTemplateBuilder.TemplateName]
  );

  templateRegistry.register(
    ExpressRouteBindTemplateBuilder.TemplateName,
    new ExpressRouteBindTemplateBuilder(),
    templateSchemas[ExpressRouteBindTemplateBuilder.TemplateName]
  );

  templateRegistry.register(
    ExpressRouteFactoryMethodTemplateBuilder.TemplateName,
    new ExpressRouteFactoryMethodTemplateBuilder(),
    templateSchemas[ExpressRouteFactoryMethodTemplateBuilder.TemplateName]
  );
};
