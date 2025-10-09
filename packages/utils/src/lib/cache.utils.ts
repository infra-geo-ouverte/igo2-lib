export function customCacheHasher(parameters: unknown[]): unknown[] {
  return parameters.map((param) => {
    if (
      typeof param === 'object' &&
      param != null &&
      typeof param.toString === 'function'
    ) {
      return param.toString();
    }
    return param !== undefined ? JSON.parse(JSON.stringify(param)) : param;
  });
}
