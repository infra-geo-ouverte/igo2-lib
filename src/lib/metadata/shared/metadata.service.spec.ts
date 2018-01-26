import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';
import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        MetadataService
      ]
    });
  });

  it('should ...', inject([MetadataService], (service: MetadataService) => {
    expect(service).toBeTruthy();
  }));
});
