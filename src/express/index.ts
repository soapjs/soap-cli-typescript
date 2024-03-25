import { TemplateSchemaMap } from "@soapjs/soap-cli-common";
import { TemplateRegistry } from "../common";
import { ExpressConfigTemplateBuilder } from "./templates/express-config.template-builder";
import { ExpressDependencyBindTemplateBuilder } from "./templates/express-dependency-bind.template-builder";
import { ExpressRouteBindTemplateBuilder } from "./templates/express-route-bind.template-builder";
import { ExpressRouteFactoryMethodTemplateBuilder } from "./templates/express-route-factory-method.template-builder";

export * from "./models/express.template-model.builder";
export * from "./strategies/express-project.build-strategy";
export * from "./strategies/express-project.init-strategy";
export * from "./templates/express-config.template-builder";
export * from "./templates/express-dependencies.template-builder";
export * from "./templates/express-dependency-bind.template-builder";
export * from "./templates/express-launcher.template-builder";
export * from "./templates/express-route-bind.template-builder";
export * from "./templates/express-route-factory-method.template-builder";
export * from "./templates/express-router.template";

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
