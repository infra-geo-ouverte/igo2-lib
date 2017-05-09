import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { ActivityService, RequestService, MessageService } from '../../core';
import { ToolService } from '../../tool';

import { ContextService,
         provideContextServiceOptions } from './context.service';


describe('ContextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        provideContextServiceOptions({
          basePath: 'contexts',
          contextListFile: '_contexts.json'
        }),
        ActivityService,
        ContextService,
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
