import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EntityService } from './entity.service';

describe('EntityService', () => {
  let service: EntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(EntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
