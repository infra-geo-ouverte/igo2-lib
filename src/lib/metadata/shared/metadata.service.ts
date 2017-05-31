import { Injectable } from '@angular/core';

import { MetadataOptions } from '.';

@Injectable()
export class MetadataService {

  constructor() { }

  open(metadata: MetadataOptions) {
    if (metadata.extern) {
      window.open(metadata.url, '_blank');
    }
  }

}
