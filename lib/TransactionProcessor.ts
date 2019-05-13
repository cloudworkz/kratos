import * as Debug from "debug";
const debug = Debug("service:processor");
import * as Bluebird from "bluebird";

import Service from "./Service";
import CustomStream from "./CustomStream";
import HttpClient from "./HttpClient";
import { GCSStream } from "./interfaces/GCSStream";
import { Transaction } from "./interfaces";

export default class TransactionProcessor {

  private service: Service;
  private transactionsInProcess: Transaction[];
  private intv: any;

  constructor(service: Service) {
    this.service = service;
    this.transactionsInProcess = [];
    this.intv = setInterval(() => {
      this.service.metrics.set("current_transactions", this.transactionsInProcess.length);
    }, 500);
  }

  public async processTransaction(
    transactionId: string,
    chunks: number,
    baseUrl: string = "http://localhost:8080",
    contentType: string = "application/octet-stream",
    extension: string = "parquet"): Promise<boolean> {

    if (!baseUrl) {
      throw new Error("baseUrl is missing.");
    }

    const chunkMap = [];
    for (let i = 0; i < chunks; i++) {
      chunkMap.push(i);
    }

    if (!chunkMap.length) {
      throw new Error("No chunks to process.");
    }

    if (this.getInProcess(transactionId)) {
      throw new Error("transactionId " + transactionId + " is already in process.");
    }

    const transaction: Transaction = {
      transactionId,
      chunks,
      baseUrl,
      contentType,
      extension,
      atChunk: 0,
    };

    this.addInProcess(transaction);
    if (!(await this.startTransaction(baseUrl, transactionId))) {
      this.removeInProcess(transactionId, false);
      throw new Error("Could not start transaction");
    }

    const gcs$ = this.service.googleStorage.getStoreStream(`${transactionId}.${extension}`, contentType);

    // no need to await, because gcs$.end() controlls gcs$.promise resolving
    Bluebird.mapSeries(chunkMap, async (chunkId) => {
      this.setInProcessChunk(transactionId, chunkId);
      await this.streamChunk(gcs$, transactionId, chunkId, baseUrl);
    }).then(() => {
      gcs$.end();
    });

    return gcs$.promise.then(() => {
      debug("Transaction streaming done.");
      return this.ackTransaction(baseUrl, transactionId).then((result) => {
        this.removeInProcess(transactionId, true);
        return result;
      }).catch((error) => {
        this.removeInProcess(transactionId, false);
        throw error;
      });
    }).catch((error) => {
      debug("Transaction failed", error.message);
      this.removeInProcess(transactionId, false);
      return false;
    });
  }

  public getTransactionsInProcess() {
    return this.transactionsInProcess;
  }

  public close() {

    if (this.intv) {
      clearInterval(this.intv);
    }
  }

  private streamChunk(gcs$: GCSStream, transactionId: string, chunkId: number, baseUrl: string) {
    return new Promise((resolve) => {

      const custom$ = new CustomStream(gcs$, true);
      const http$ = HttpClient.getRequestStream({
        url: `${baseUrl}/request/${transactionId}/chunk/${chunkId}`,
        method: "GET",
      });

      http$.pipe(custom$);
      http$.on("end", () => {
        resolve();
      });
    });
  }

  private async startTransaction(baseUrl: string, transactionId: string): Promise<boolean> {

    const { status, body } = await HttpClient.call({
      url: `${baseUrl}/start/${transactionId}`,
      method: "POST",
    });

    debug("Start transation", status);
    this.service.metrics.inc("transaction_start");
    return status === 200;
  }

  private async ackTransaction(baseUrl: string, transactionId: string): Promise<boolean> {

    const { status, body } = await HttpClient.call({
      url: `${baseUrl}/ack/${transactionId}`,
      method: "DELETE",
    });

    debug("ACK transation", status);
    this.service.metrics.inc("transaction_ack");
    return status === 204;
  }

  private addInProcess(transaction: Transaction) {
    this.service.metrics.inc("transaction_start");
    this.transactionsInProcess.push(transaction);
  }

  private getInProcess(transactionId: string): Transaction | null {

    for (let i = this.transactionsInProcess.length - 1; i >= 0; i--) {
      if (this.transactionsInProcess[i].transactionId === transactionId) {
        return this.transactionsInProcess[i];
      }
    }

    return null;
  }

  private setInProcessChunk(transactionId: string, chunkId: number): boolean {

    this.service.metrics.inc("transaction_chunk");

    const transaction = this.getInProcess(transactionId);
    if (transaction) {
      debug("Updating transaction chunk", transactionId, transaction.atChunk, "->", chunkId);
      transaction.atChunk = chunkId;
      return true;
    }

    return false;
  }

  private removeInProcess(transactionId: string, successfull: boolean): boolean {

    if (successfull) {
      this.service.metrics.inc("transaction_successfull");
    } else {
      this.service.metrics.inc("transaction_failed");
    }

    this.service.metrics.inc("transaction_done");

    for (let i = this.transactionsInProcess.length - 1; i >= 0; i--) {
      if (this.transactionsInProcess[i].transactionId === transactionId) {
        this.transactionsInProcess.splice(i, 1);
        return true;
      }
    }

    return false;
  }
}
