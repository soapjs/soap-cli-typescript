import { ContainerAddons, ProjectDescription } from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../common/template-registry";
import { camelCase } from "change-case";

type RepoContext = {
  use_default_collection: boolean;
  collection_base_class_name: string;
  collection_class_name: string;
  source_instance_name: string;
  model_class_name: string;
  table: string;
  mapper_class_name: string;
  query_factory_class_name: string;
};

export type ExpressDependencyBindTemplateContext = {
  sources: {
    instance_name: string;
    class_name: string;
  }[];
  bindings: {
    class_name: string;
    use_inversify?: boolean;
    use_singleton?: boolean;
    instance_name?: string;
    is_repository?: boolean;
    is_use_case?: boolean;
    is_toolset?: boolean;
    is_service?: boolean;
    is_controller?: boolean;
    impl_base_class_name?: string;
    impl_class_name?: string;
    entity_class_name?: string;
    use_default_impl?: boolean;
    contexts?: RepoContext[];
  }[];
};

export class ExpressDependencyBindTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `express-dependency-bind`;

  build(
    model: { template: string; content: ContainerAddons },
    project: ProjectDescription
  ) {
    const context: ExpressDependencyBindTemplateContext = {
      sources: [],
      bindings: [],
    };
    const templates: string[] = [];
    const sources = new Map<string, boolean>();

    model.content.repositories.forEach((binding) => {
      const contexts: RepoContext[] = [];

      binding.contexts.forEach((ctx) => {
        const {
          mapper: mapper_class_name,
          model: model_class_name,
          query_factory: query_factory_class_name,
          collection: collection_class_name,
          collection_base_class: collection_base_class_name,
          source,
          table,
          type,
          include_source_init,
        } = ctx;
        const source_instance_name = camelCase(source);

        if (include_source_init && sources.has(type) === false) {
          context.sources.push({
            instance_name: source_instance_name,
            class_name: source,
          });
          sources.set(type, true);
        }

        contexts.push({
          use_default_collection: !collection_class_name,
          collection_base_class_name,
          collection_class_name,
          model_class_name,
          source_instance_name,
          table,
          mapper_class_name,
          query_factory_class_name,
        });
      });

      context.bindings.push({
        is_repository: true,
        use_inversify: project.ioc === "inversify",
        use_singleton: project.ioc === "singleton",
        instance_name: binding.repository_impl_class_name
          ? camelCase(binding.repository_impl_class_name)
          : `${camelCase(binding.class_name)}Impl`,
        use_default_impl: !binding.repository_impl_class_name,
        impl_base_class_name: binding.default_class_name,
        impl_class_name: binding.repository_impl_class_name,
        entity_class_name: binding.entity,
        class_name: binding.class_name,
        contexts,
      });
    });

    model.content.controllers.forEach((binding) => {
      context.bindings.push({
        is_controller: true,
        use_inversify: project.ioc === "inversify",
        use_singleton: project.ioc === "singleton",
        class_name: binding.class_name,
      });
    });

    model.content.services.forEach((binding) => {
      context.bindings.push({
        is_service: true,
        use_inversify: project.ioc === "inversify",
        use_singleton: project.ioc === "singleton",
        class_name: binding.class_name,
        impl_class_name: binding.service_impl_class_name,
      });
    });

    model.content.toolsets.forEach((binding) => {
      context.bindings.push({
        is_toolset: true,
        use_inversify: project.ioc === "inversify",
        use_singleton: project.ioc === "singleton",
        class_name: binding.class_name,
      });
    });

    model.content.use_cases.forEach((binding) => {
      context.bindings.push({
        is_use_case: true,
        use_inversify: project.ioc === "inversify",
        use_singleton: project.ioc === "singleton",
        class_name: binding.class_name,
      });
    });

    return this.template(context);
  }
}
