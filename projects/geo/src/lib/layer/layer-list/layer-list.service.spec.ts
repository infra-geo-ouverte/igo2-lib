import { TestBed, inject } from '@angular/core/testing';

import { LayerListService } from './layer-list.service';

describe('StyleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LayerListService
      ]
    });
  });

  it('should ...', inject([LayerListService], (service: LayerListService) => {
    expect(service).toBeTruthy();
  }));

});
