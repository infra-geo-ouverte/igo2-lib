import { TestBed, inject } from '@angular/core/testing';

import { IgoCoreModule } from '../../core';

import { PrintService } from './print.service';

describe('PrintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot()
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
