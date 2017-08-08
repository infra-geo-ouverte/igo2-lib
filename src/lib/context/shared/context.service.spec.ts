import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';
import { ToolService } from '../../tool';
import { ContextService } from './context.service';


describe('ContextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [
        ContextService,
        ToolService
      ]
    });
  });

  it('should ...', inject([ContextService], (service: ContextService) => {
    expect(service).toBeTruthy();
  }));
});
