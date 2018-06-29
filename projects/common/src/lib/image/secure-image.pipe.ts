import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Pipe({
  name: 'secureImage'
})
export class SecureImagePipe implements PipeTransform {
  constructor(private http: HttpClient) {}

  transform(url: string) {
    return this.http
      .get(url, {
        headers: {
          activityInterceptor: 'false'
        },
        responseType: 'blob'
      })
      .pipe(
        switchMap(blob => {
          return Observable.create(observer => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              observer.next(reader.result);
            };
          });
        })
      );
  }
}
