import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ContextService } from './context.service';

describe('ContextService', () => {
  let service: ContextService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    service = TestBed.inject(ContextService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    const req = httpMock.expectOne('contexts/_contexts.json');
    req.flush([]);
    expect(service).toBeTruthy();
  });
});
