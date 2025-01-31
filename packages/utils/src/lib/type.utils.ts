// Make all optional properties required
export type OptionalRequired<T> = {
  [K in keyof T]-?: T[K];
};
