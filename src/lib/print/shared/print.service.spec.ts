import { TestBed, inject } from '@angular/core/testing';

import { ActivityService, MessageService, RequestService } from '../../core';

import { PrintService } from './print.service';

describe('PrintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ActivityService,
        MessageService,
        RequestService,
        PrintService
      ]
    });
  });

  it('should ...', inject([PrintService], (service: PrintService) => {
    expect(service).toBeTruthy();
  }));
});
