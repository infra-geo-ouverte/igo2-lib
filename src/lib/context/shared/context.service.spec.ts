import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RequestService, MessageService } from '../../core';

import { ContextService } from './context.service';


describe('ContextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        ContextService,
        MessageService,
        RequestService
      ]
    });
  });

  it('should ...', inject([ContextService], (service: ContextService) => {
    expect(service).toBeTruthy();
  }));
});
