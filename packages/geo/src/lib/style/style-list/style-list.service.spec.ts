import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { StyleListService } from './style-list.service';

describe('StyleListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [StyleListService]
    });
  });

  it('should ...', inject([StyleListService], (service: StyleListService) => {
    expect(service).toBeTruthy();
  }));
});
