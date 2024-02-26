import { ProjectDescription } from "@soapjs/soap-cli-common";

export const UNKNOWN_WEB_FRAMEWORK_LAUNCHER_TEMPLATE = `
__IMPORTS__
import { Routes } from './routes';
import { Dependencies } from './dependencies';

const start = async () => {
  /* PLEASE INITIALIZE WEB FRAMEWORK OF YOUR CHOISE */
  const your_web_framework = {
    get:(...args: any[]) => {},
    post:(...args: any[]) => {},
    put:(...args: any[]) => {},
    patch:(...args: any[]) => {},
    delete:(...args: any[]) => {},
    listen:(...args: any[]) => {},
    use:(...args: any[]) => {}
  }
  __DEPENDENCIES__
  const routes = new Routes(your_web_framework);
  routes.configure(__ROUTES_CONFIGURE_ARGS__);

  /* RUN SERVER */
  your_web_framework.listen(port, () => {
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

export class BasicLauncherTemplate {
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

    return UNKNOWN_WEB_FRAMEWORK_LAUNCHER_TEMPLATE.replace(
      "__IMPORTS__",
      __IMPORTS__
    )
      .replace("__DEPENDENCIES__", __DEPENDENCIES__)
      .replace("__ROUTES_CONFIGURE_ARGS__", __ROUTES_CONFIGURE_ARGS__)
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
