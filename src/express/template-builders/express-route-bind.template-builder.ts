import { ProjectDescription, RouteMountModel } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../common/template-registry";
import { camelCase } from "change-case";

export type ExpressRouteBindTemplateContext = {
  routes: {
    use_controller: boolean;
    use_inversify?: boolean;
    use_singleton?: boolean;
    controller_class_name: string;
    controller_instance_name: string;
    handler_name: string;
    route_class_name: string;
  }[];
};

export class ExpressRouteBindTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `express-route-bind`;

  build(
    model: {
      content: RouteMountModel[];
      template: string;
    },
    project: ProjectDescription
  ): string {
    const context: ExpressRouteBindTemplateContext = {
      routes: [],
    };
    model.content.forEach((route) => {
      context.routes.push({
        use_controller: !route.skip_controller_resolver,
        use_inversify: project.ioc === "inversify",
        use_singleton: project.ioc === "singleton",
        controller_instance_name: camelCase(route.controller),
        controller_class_name: route.controller,
        route_class_name: route.name,
        handler_name: route.handler,
      });
    });

    return this.template(context);
  }
}
