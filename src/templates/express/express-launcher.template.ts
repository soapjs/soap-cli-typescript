import { ProjectDescription } from "@soapjs/soap-cli-common";

export const EXPRESS_LAUNCHER_TEMPLATE = `
__IMPORTS__
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { Routes } from './routes';
import { Dependencies } from './dependencies';

const start = async () => {
  const app = express();
  app.use(
    cors({
      origin: '*',
    })
  );
  app.use(bodyParser.json());
  __DEPENDENCIES__
  const routes = new Routes(app);
  routes.configure(__ROUTES_CONFIGURE_ARGS__);

  app.listen(port, () => {
    console.log(\`Server is running at http://localhost:\${port}\`);
  });
};

start();
`;

const INVERSIFY_DEPENDENCIES_SETUP_TEMPLATE = `
  const container = new Container();
  const dependencies = new Dependencies();
  dependencies.configure(container);
`;

const SINGLETON_DEPENDENCIES_SETUP_TEMPLATE = `
  const dependencies = new Dependencies();
  dependencies.configure();
`;

export class ExpressLauncherTemplate {
  static parse(model: any, project: ProjectDescription): string {
    let __IMPORTS__ = "";
    let __DEPENDENCIES__ = "";
    let __ROUTES_CONFIGURE_ARGS__ = "";

    if (project.ioc === "inversify") {
      __IMPORTS__ = `import { Container } from 'inversify';`;
      __DEPENDENCIES__ = INVERSIFY_DEPENDENCIES_SETUP_TEMPLATE;
      __ROUTES_CONFIGURE_ARGS__ = "container";
    } else {
      __DEPENDENCIES__ = SINGLETON_DEPENDENCIES_SETUP_TEMPLATE;
    }

    return EXPRESS_LAUNCHER_TEMPLATE.replace("__IMPORTS__", __IMPORTS__)
      .replace("__DEPENDENCIES__", __DEPENDENCIES__)
      .replace("__ROUTES_CONFIGURE_ARGS__", __ROUTES_CONFIGURE_ARGS__)
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
