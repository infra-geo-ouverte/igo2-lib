import { inject } from '@angular/core/testing';

import { MediaService } from './media.service';

describe('MediaService', () => {
  it('should create', inject([MediaService], (service: MediaService) => {
    expect(service).toBeTruthy();
  }));
});
