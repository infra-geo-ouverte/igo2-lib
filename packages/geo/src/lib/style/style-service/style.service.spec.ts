import { inject } from '@angular/core/testing';

import { StyleService } from './style.service';

describe('StyleService', () => {
  it('should create', inject([StyleService], (service: StyleService) => {
    expect(service).toBeTruthy();
  }));
});
