import * as Debug from "debug";
const debug = Debug("service:googlestorage");
import { Storage } from "@google-cloud/storage";
import { GCSStream } from "./interfaces/GCSStream";

export default class GoogleStorage {

  public config: any;
  private readonly storage: Storage;
  private readonly bucket: any;

  constructor(config: any = {}) {
    this.config = config;
    this.storage = new Storage(this.config.client);
    this.bucket = this.storage.bucket(this.config.bucketName);
    debug("Ready for", this.config.client.projectId, this.config.bucketName);
  }

  public async init() {

    debug("Checking if bucket exists..");

    try {
      const data = await this.bucket.exists();
      if (!data || !data[0]) {
        debug("Bucket does not exist.");
        return 0;
      }

      debug("Bucket exists.");
      return 1;
    } catch (error) {
      debug("Bucket does not exist", error.message);
      return 0;
    }
  }

  public getStoreStream(filePath: string, contentType: string): GCSStream {

    debug("Creating stream", filePath);
    const blob = this.bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType,
      },
      gzip: true,
      public: false,
      private: false,
      resumable: true,
    });

    const promise = new Promise((resolve, reject) => {

      blobStream.on("error", (error: Error) => {
        debug("Error during file stream", filePath, error.message);
        reject(error);
      });

      blobStream.on("finish", () => {
        debug("Finished stream", filePath);
        resolve();
      });
    });

    return {
      promise,
      end: () => {
        debug("Stream end called..");
        blobStream.end();
      },
      write: (chunk: any) => {
        debug("Stream chunk written..");
        blobStream.write(chunk);
      },
    };
  }

  public getMetadata(filePath: string) {
    debug("Requesting metadata", filePath);
    const blob = this.bucket.file(filePath);
    return blob.getMetadata().then((results: any) => {
      return results[0];
    });
  }

  public deleteFile(filePath: string) {
    debug("Deleting file", filePath);
    const blob = this.bucket.file(filePath);
    return blob.delete();
  }
}
