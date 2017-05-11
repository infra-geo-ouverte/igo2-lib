import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IgoCoreModule } from '../../core';
import { ToolService } from '../../tool';

import { ContextService,
         provideContextServiceOptions } from './context.service';


describe('ContextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        IgoCoreModule.forRoot()
      ],
      providers: [
        provideContextServiceOptions({
          basePath: 'contexts',
          contextListFile: '_contexts.json'
        }),
        ContextService,
        ToolService
      ]
    });
  });

  it('should ...', inject([ContextService], (service: ContextService) => {
    expect(service).toBeTruthy();
  }));
});
