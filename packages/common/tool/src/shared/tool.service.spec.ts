import { inject } from '@angular/core/testing';

import { ToolService } from './tool.service';

describe('ToolService', () => {
  it('should create', inject([ToolService], (service: ToolService) => {
    expect(service).toBeTruthy();
  }));
});
