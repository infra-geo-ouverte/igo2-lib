import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';
import { DownloadService } from './download.service';

describe('DownloadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        DownloadService
      ]
    });
  });

  it('should ...', inject([DownloadService], (service: DownloadService) => {
    expect(service).toBeTruthy();
  }));
});
