import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { MeasureService } from './measure.service';

describe('MeasureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [MeasureService]
    });
  });

  it('should ...', inject([MeasureService], (service: MeasureService) => {
    expect(service).toBeTruthy();
  }));
});
