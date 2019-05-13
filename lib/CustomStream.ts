import * as Debug from "debug";
const debug = Debug("service:stream");
import * as stream from "stream";
import { GCSStream } from "./interfaces/GCSStream";

export default class CustomStream extends stream.Writable {

  private gcsStream: GCSStream;
  private dontEnd: boolean;

  constructor(gcsStream: GCSStream, dontEnd: boolean = false) {
    super();
    this.writable = true;
    this.gcsStream = gcsStream;
    this.dontEnd = dontEnd;
  }

  public write(chunk: any, callback: any): boolean {

    this.gcsStream.write(chunk);

    if (callback) {
      callback();
    }

    return true;
  }

  public end() {
    if (!this.dontEnd) {
      this.gcsStream.end();
    }
  }
}
