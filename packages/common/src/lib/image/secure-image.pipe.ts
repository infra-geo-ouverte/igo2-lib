import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Cacheable } from 'ts-cacheable';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from '@igo2/core';

@Pipe({
  name: 'secureImage'
})
export class SecureImagePipe implements PipeTransform {
  constructor(
    private http: HttpClient,
    private configService?: ConfigService) {}

  @Cacheable({
    maxCacheCount: 20
  })
  transform(url: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      activityInterceptor: 'false'
    });

    const regexDepot = new RegExp(this.configService.getConfig('depot.url') + '.*?(?="|$)');
    if (regexDepot.test(url)) {
      url = url.match(regexDepot)[0];
    }

    return this.http
      .get(url, {
        headers,
        responseType: 'blob'
      })
      .pipe(
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
}
