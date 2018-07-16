import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [CatalogService]
    });
  });

  it('should ...', inject([CatalogService], (service: CatalogService) => {
    expect(service).toBeTruthy();
  }));
});
