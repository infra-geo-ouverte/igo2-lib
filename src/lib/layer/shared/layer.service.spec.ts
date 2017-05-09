import { TestBed, inject } from '@angular/core/testing';

import { StyleService } from './style.service';
import { LayerService } from './layer.service';


describe('LayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        StyleService,
        LayerService
      ]
    });
  });

  it('should ...', inject([LayerService], (service: LayerService) => {
    expect(service).toBeTruthy();
  }));

});
