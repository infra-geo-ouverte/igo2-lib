import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { provideRoutingSourceService, RoutingSourceService } from './routing-source.service';
import { RoutingSource } from '../routing-sources';


describe('RoutingSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        RoutingSource,
        provideRoutingSourceService()
      ]
    });
  });

  it('should ...', inject([RoutingSourceService], (service: RoutingSourceService) => {
    expect(service).toBeTruthy();
  }));
});
