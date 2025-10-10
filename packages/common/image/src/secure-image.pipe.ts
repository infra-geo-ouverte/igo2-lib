import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { Observable } from 'rxjs';
import { Cacheable } from 'ts-cacheable';

import { fetchImageFromDepotUrl } from './image';

@Pipe({
  name: 'secureImage',
  standalone: true
})
export class SecureImagePipe implements PipeTransform {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  @Cacheable({
    maxCacheCount: 20
  })
  transform(url: string): Observable<string> {
    const depotUrl = this.configService?.getConfig('depot.url');
    return fetchImageFromDepotUrl(url, depotUrl, this.http);
  }
}
