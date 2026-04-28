import { inject } from '@angular/core/testing';

import { StyleListService } from './style-list.service';

describe('StyleListService', () => {
  it('should create', inject(
    [StyleListService],
    (service: StyleListService) => {
      expect(service).toBeTruthy();
    }
  ));
});
