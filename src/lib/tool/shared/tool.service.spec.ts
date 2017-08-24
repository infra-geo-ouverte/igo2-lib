import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';
import { ToolService } from './tool.service';

describe('ToolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [ToolService]
    });
  });

  it('should ...', inject([ToolService], (service: ToolService) => {
    expect(service).toBeTruthy();
  }));
});
