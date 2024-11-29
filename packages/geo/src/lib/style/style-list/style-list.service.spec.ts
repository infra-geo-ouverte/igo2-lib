import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { StyleListService } from './style-list.service';

describe('StyleListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [StyleListService, provideHttpClient(withInterceptorsFromDi())]
    });
  });

  it('should ...', inject([StyleListService], (service: StyleListService) => {
    expect(service).toBeTruthy();
  }));
});
