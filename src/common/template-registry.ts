import { workerLog } from "@soapjs/soap-cli-common";
import Handlebars from "handlebars";

export abstract class TemplateBuilder {
  protected template: Handlebars.TemplateDelegate;
  protected builderProvider: TemplateBuilderProvider;

  useProvider(provider: TemplateBuilderProvider) {
    this.builderProvider = provider;
    return this;
  }

  useTemplate(source: string) {
    this.template = Handlebars.compile(source);
    return this;
  }

  abstract build(...args: any[]): string;
}

export interface Builder {
  build: (...args: any[]) => string;
}

// Low level
export class TemplateBuilderProvider {
  constructor(protected registry: Map<string, Builder>) {}

  get<T = TemplateBuilder>(name: string) {
    if (!this.registry.has(name)) {
      throw new Error(`No template builder registered with name: ${name}`);
    }
    return this.registry.get(name) as T;
  }
}

// High level
export class TemplateRegistry extends TemplateBuilderProvider {
  private provider: TemplateBuilderProvider;

  constructor() {
    const registry = new Map();
    super(registry);
    this.provider = new TemplateBuilderProvider(registry);
  }

  register(name: string, builder: TemplateBuilder, source?: string) {
    builder.useProvider(this.provider);
    if (source) {
      builder.useTemplate(source);
    }
    this.registry.set(name, builder);
  }
}
