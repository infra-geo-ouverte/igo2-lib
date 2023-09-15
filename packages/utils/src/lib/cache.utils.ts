import { HttpParams } from '@angular/common/http';

export function customCacheHasher(parameters: unknown[]): unknown[] {
  return parameters.map((param) => {
    if (param instanceof HttpParams) {
      return param.toString();
    }
    return param !== undefined ? JSON.parse(JSON.stringify(param)) : param;
  });
}
