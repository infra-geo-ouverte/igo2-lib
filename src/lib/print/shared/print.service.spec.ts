import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IgoCoreModule } from '../../core';

import { PrintService } from './print.service';

describe('PrintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot(),
        HttpModule
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
