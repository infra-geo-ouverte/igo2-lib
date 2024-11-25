import { Injectable } from '@angular/core';

import { MetadataOptions } from './metadata.interface';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  open(metadata: MetadataOptions) {
    if (metadata.extern) {
      window.open(metadata.url, '_blank');
    }
  }
}
