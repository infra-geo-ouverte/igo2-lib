import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [MetadataService]
    });
  });

  it('should ...', inject([MetadataService], (service: MetadataService) => {
    expect(service).toBeTruthy();
  }));
});
