import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, catchError, switchMap } from 'rxjs';

export function fetchImageFromDepotUrl(
  url: string,
  depotUrl: string,
  http: HttpClient
) {
  const headers = new HttpHeaders({
    'Content-Type': 'text/plain',
    activityInterceptor: 'false',
    interceptError: 'false'
  });

  const regexDepot = new RegExp(depotUrl + '.*?(?="|$)');
  if (regexDepot.test(url)) {
    url = url.match(regexDepot)[0];
  }

  return http
    .get(url, {
      headers,
      responseType: 'blob'
    })
    .pipe(
      catchError((err) => {
        err.error.caught = true;
        err.error.toDisplay = false;
        throw err;
      }),
      switchMap((blob) => {
        return new Observable((observer) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            observer.next(reader.result);
            observer.complete();
          };
        });
      })
    ) as Observable<string>;
}
