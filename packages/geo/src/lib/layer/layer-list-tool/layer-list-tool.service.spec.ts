import { TestBed } from '@angular/core/testing';

import { FormDialogService } from '@igo2/common/form';

import { LayerService } from '../shared';
import { LayerListToolService } from './layer-list-tool.service';

describe('LayerListToolService', () => {
  let service: LayerListToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayerListToolService, LayerService, FormDialogService]
    });
    service = TestBed.inject(LayerListToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
