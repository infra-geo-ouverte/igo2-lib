import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';
import { CatalogService } from './catalog.service';


describe('CatalogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [
        CatalogService
      ]
    });
  });

  it('should ...', inject([CatalogService], (service: CatalogService) => {
    expect(service).toBeTruthy();
  }));
});
