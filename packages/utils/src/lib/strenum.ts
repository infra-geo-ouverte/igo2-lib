/** Utility function to create a K:V from a list of strings */
export function strEnum<T extends string>(o: T[]): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}
