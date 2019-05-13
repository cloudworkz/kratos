import * as Debug from "debug";
const debug = Debug("service:service");

import HttpServer from "./api/HttpServer";
import { Metrics } from "./Metrics";
import GoogleStorage from "./GoogleStorage";

import { ServiceConfig } from "./interfaces";
import * as pjson from "../package.json";
import TransactionProcessor from "./TransactionProcessor";

const GRACE_EXIT_MS = 1250;

export default class Service {

  public readonly config: ServiceConfig;
  public readonly metrics: Metrics;
  public readonly googleStorage: GoogleStorage;
  public readonly transactionProcess: TransactionProcessor;

  private readonly httpServer: HttpServer;
  private alive: boolean = true;
  private ready: boolean = false;

  constructor(config: ServiceConfig) {

    if (!config || typeof config !== "object") {
      throw new Error("Config must be an object: {kafka, http}");
    }

    if (!pjson || !pjson.name) {
      throw new Error("Missing package.json or package.json:name");
    }

    this.config = config;
    this.metrics = new Metrics(pjson.name, [], []);
    this.httpServer = new HttpServer(this.config.http, this);
    this.googleStorage = new GoogleStorage(this.config.gcs);
    this.transactionProcess = new TransactionProcessor(this);
  }

  private shutdownOnErrorIfNotProduction() {

    if (!Service.isProduction()) {
      debug("Shutting down (because of error) in", GRACE_EXIT_MS, "ms");
      this.close();
      setTimeout(() => {
        process.exit(1);
      }, GRACE_EXIT_MS);
    }
  }

  private shutdownGracefully() {

    debug("\nShutting down gracefully in", GRACE_EXIT_MS, "ms");
    this.close();
    debug("Bye..");

    setTimeout(() => {
      process.exit(0);
    }, GRACE_EXIT_MS);
  }

  private init() {

    process.on("SIGINT", this.shutdownGracefully.bind(this));
    process.on("SIGUSR1", this.shutdownGracefully.bind(this));
    process.on("SIGUSR2", this.shutdownGracefully.bind(this));

    /*
    process.on("warning", (warning: Error) => {
        debug("Warning:", warning.message);
    }); */

    process.on("uncaughtException", (error: Error) => {
      debug("Unhandled Exception: ", error.message, error.stack);
      this.shutdownOnErrorIfNotProduction();
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      debug("Unhandled Rejection: ", reason);
      this.shutdownOnErrorIfNotProduction();
    });

    if (Service.isProduction()) {
      debug("Running production.");
    } else {
      debug("Running NOT in production.");
    }
  }

  public async run() {
    this.init();

    debug("Starting..");

    this.metrics.registerDefault();

    await this.httpServer.start();
    await this.googleStorage.init();

    this.setReadyState(true);
    debug("Running..");
  }

  public async close() {

    debug("Closing..");
    this.setAliveState(false);
    this.setReadyState(false);

    this.httpServer.close();
    this.transactionProcess.close();
    this.metrics.close();
  }

  public static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  public setAliveState(state: boolean): void {
    debug("Setting alive state from", this.alive, "to", state);
    this.alive = state;
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public getHealthInfo(): [number, any] {
    const alive = this.isAlive();
    const status = alive ? 200 : 503;
    return [status, {
      status: alive ? "UP" : "DOWN",
    }];
  }

  public setReadyState(state: boolean): void {
    debug("Setting ready state from", this.ready, "to", state);
    this.ready = state;
  }

  public isReady(): boolean {
    return this.ready;
  }
}
