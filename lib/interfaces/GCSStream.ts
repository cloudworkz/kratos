export interface GCSStream {
  promise: Promise<{}>;
  end: () => void;
  write: (chunk: any) => void;
}
