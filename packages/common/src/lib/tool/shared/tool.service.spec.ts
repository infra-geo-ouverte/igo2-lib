import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ToolService } from './tool.service';

describe('ToolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ToolService]
    });
  });

  it('should ...', inject([ToolService], (service: ToolService) => {
    expect(service).toBeTruthy();
  }));
});
