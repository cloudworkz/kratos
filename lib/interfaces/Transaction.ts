export interface Transaction {
  baseUrl: string;
  chunks: number;
  transactionId: string;
  contentType: string;
  extension: string;
  atChunk: number;
}
