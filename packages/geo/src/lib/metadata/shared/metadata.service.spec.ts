import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from '../../../../test-config';
import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [MetadataService]
      })
    );
  });

  it('should ...', inject([MetadataService], (service: MetadataService) => {
    expect(service).toBeTruthy();
  }));
});
