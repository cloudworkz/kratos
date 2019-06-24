export interface GCSStream {
  promise: Promise<unknown>;
  end: () => void;
  write: (chunk: any) => void;
}
