import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';

import { PrintService } from './print.service';

describe('PrintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        PrintService
      ]
    });
  });

  it('should ...', inject([PrintService], (service: PrintService) => {
    expect(service).toBeTruthy();
  }));
});
