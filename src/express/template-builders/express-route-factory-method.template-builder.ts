import {
  AuthOptions,
  CorsJson,
  ProjectDescription,
  RateLimiterJson,
  ValidatorOptions,
  workerLog,
} from "@soapjs/soap-cli-common";
import { TemplateBuilder } from "../../common/template-registry";

export type ExpressRouteFactoryTemplateContext = {
  name: string;
  route: string;
  path: string;
  use_options?: boolean;
  io?: string;
  use_authorization?: boolean;
  authorization?: string[];
  authorization_comments?: string[];
  validator?: ValidatorOptions;
  use_cors?: boolean;
  cors?: string[];
  cors_comments?: string[];
  use_limiter?: boolean;
  use_validator?: boolean;
  limiter?: string[];
  limiter_comments?: string[];
  middlewares?: any[];
};

export type RouteFactoryMethodOptions = {
  methodName: string;
  route: string;
  path: string;
  io?: string;
  auth?: AuthOptions;
  schema?: ValidatorOptions;
  cors?: CorsJson;
  limiter?: RateLimiterJson;
  middlewares?: any[];
};

export class ExpressRouteFactoryMethodTemplateBuilder extends TemplateBuilder {
  public static TemplateName = `express-route-factory-method`;

  build(model: RouteFactoryMethodOptions, project: ProjectDescription): string {
    const { path, methodName: name, route, io } = model;
    const context: ExpressRouteFactoryTemplateContext = {
      name,
      path,
      route,
    };

    context.middlewares = Array.isArray(model.middlewares)
      ? model.middlewares.map((m) => JSON.stringify(m, null, 2))
      : [];

    if (model.auth) {
      context.use_authorization = true;
      context.authorization = [
        `authenticator: "${model.auth.authenticator}"`,
        `type: "${model.auth.type}"`,
      ];
      context.authorization_comments = [
        "secretOrKey: string,",
        "algorithm: string,",
        "issuer: string,",
        "audience: string | string[],",
        "tokenExpiresIn: string | number,",
        "apiKeyHeader: string,",
        "apiKeyQueryParam: string,",
      ];
    }

    if (model.cors) {
      context.use_cors = true;
      context.cors = [];
      Object.keys(model.cors).forEach((key) => {
        const value = model.cors[key];
        if (value) {
          context.cors.push(
            `${key}: ${typeof value === "string" ? '"' + value + '"' : value}`
          );
        }
      });
      context.cors_comments = [
        "origin: string | string[] | RegExp,",
        "methods: string | string[],",
        "headers: string | string[],",
        "credentials: boolean,",
        "exposedHeaders: string | string[],",
        "maxAge: number,",
      ];
    }

    if (model.limiter) {
      context.use_limiter = true;
      context.limiter = [];
      Object.keys(model.limiter).forEach((key) => {
        const value = model.limiter[key];
        if (value) {
          context.limiter.push(
            `${key}: ${typeof value === "string" ? '"' + value + '"' : value}`
          );
        }
      });
      context.limiter_comments = [
        "maxRequests: number,",
        "windowMs: number,",
        "mandatory: boolean,",
      ];
    }

    if (model.schema) {
      context.use_validator = true;
      context.validator = {
        validator: `"${model.schema.validator}"`,
        schema: model.schema.schema,
      };
    }

    if (model.io) {
      context.io = model.io;
    }

    context.use_options =
      context.use_authorization ||
      !!context.io ||
      context.use_cors ||
      context.use_limiter ||
      context.use_validator;

    return this.template(context);
  }
}
