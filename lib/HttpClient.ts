import * as Debug from "debug";
const debug = Debug("service:httpclient");
import * as request from "request";

export default class HttpClient {

  public static call(options: any): Promise<{ status: number, headers: any, body: any }> {

    debug("Calling", options);
    const startT = Date.now();

    return new Promise((resolve, reject) => {
      request(options, (error: Error, response: any, body: any) => {

        if (error) {
          debug("Request failed", error.message);
          return reject(error);
        }

        const diffMs = Date.now() - startT;
        debug("Resolved", response.statusCode, "took", diffMs, "ms");

        resolve({
          status: response.statusCode,
          headers: response.headers,
          body,
        });
      });
    });
  }

  public static getRequestStream(options: any) {

    debug("Calling for stream", options);
    const startT = Date.now();

    return request(options)
      .on("error", (error) => {
        debug("Request failed", error.message);
      })
      .on("response", (response) => {
        const diffMs = Date.now() - startT;
        debug("Resolved", response.statusCode, response.headers["content-type"], "took", diffMs, "ms");
      });
  }
}
