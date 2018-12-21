import { TestBed } from '@angular/core/testing';

import { MeasureService } from '../shared';

describe('MeasureDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [MeasureService]
    });
  });

  it('should create an instance', () => {
    expect(true).toBeTruthy();
  });
});
