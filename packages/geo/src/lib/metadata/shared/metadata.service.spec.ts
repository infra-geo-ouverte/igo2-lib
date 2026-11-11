import { inject } from '@angular/core/testing';

import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  it('should create', inject([MetadataService], (service: MetadataService) => {
    expect(service).toBeTruthy();
  }));
});
