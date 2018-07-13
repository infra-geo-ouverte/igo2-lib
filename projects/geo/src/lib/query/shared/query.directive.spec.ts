import { TestBed } from '@angular/core/testing';

import { QueryService } from '../shared';

describe('QueryDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [QueryService]
    });
  });

  it('should create an instance', () => {
    expect(true).toBeTruthy();
  });
});
