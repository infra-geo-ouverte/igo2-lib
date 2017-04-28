import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RequestService, MessageService } from '../../core';
import { ToolService } from '../../tool';

import { ContextService } from './context.service';
import { provideContextService } from '../module';


describe('ContextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        provideContextService(),
        MessageService,
        RequestService,
        ToolService
      ]
    });
  });

  it('should ...', inject([ContextService], (service: ContextService) => {
    expect(service).toBeTruthy();
  }));
});
