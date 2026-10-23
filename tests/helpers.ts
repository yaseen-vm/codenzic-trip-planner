// A promise the test resolves or rejects by hand, to control the order of async responses.
export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export const START = { latitude: 9.9, longitude: 76.2 };
export const END = { latitude: 10, longitude: 76.3 };
