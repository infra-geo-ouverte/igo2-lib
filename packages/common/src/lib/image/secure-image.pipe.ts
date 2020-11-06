import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Pipe({
  name: 'secureImage'
})
export class SecureImagePipe implements PipeTransform {
  constructor(private http: HttpClient) {}

  transform(url: string): Observable<string> {
    const headers1 = new HttpHeaders();
    headers1.append('Content-Type', 'text/plain');
    headers1.append('activityInterceptor', 'false');
    return this.http
      .get(url, {
        headers: headers1,
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
