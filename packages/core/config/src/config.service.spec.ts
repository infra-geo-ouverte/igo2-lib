import { inject } from '@angular/core/testing';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  it('should create', inject([ConfigService], (service: ConfigService) => {
    expect(service).toBeTruthy();
  }));
});
