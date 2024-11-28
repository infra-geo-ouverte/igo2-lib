import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [MetadataService, provideHttpClient(withInterceptorsFromDi())]
    });
  });

  it('should ...', inject([MetadataService], (service: MetadataService) => {
    expect(service).toBeTruthy();
  }));
});
