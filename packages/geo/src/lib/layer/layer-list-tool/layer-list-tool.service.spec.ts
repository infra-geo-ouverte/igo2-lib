import { TestBed, inject } from '@angular/core/testing';

import { LayerListToolService } from './layer-list-tool.service';

describe('LayerListToolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [LayerListToolService]
    });
  });

  it('should ...', inject(
    [LayerListToolService],
    (service: LayerListToolService) => {
      expect(service).toBeTruthy();
    }
  ));
});
