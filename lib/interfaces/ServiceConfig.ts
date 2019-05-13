import { HttpConfig } from "./HttpConfig";

export interface ServiceConfig {
  http: HttpConfig;
  gcs: {
    client: {
      projectId: string;
      keyFilename?: string;
    };
    bucketName: string;
  };
}
