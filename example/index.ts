import { Service } from "..";
import { serviceConfig } from "./exampleConfig";

const service = new Service(serviceConfig);
service
  .run()
  /* tslint:disable */
  .catch(console.error);
    /* tslint:enable */
