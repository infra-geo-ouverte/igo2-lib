import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { ToolService } from './tool.service';

describe('ToolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ToolService, provideHttpClient(withInterceptorsFromDi())]
    });
  });

  it('should ...', inject([ToolService], (service: ToolService) => {
    expect(service).toBeTruthy();
  }));
});
