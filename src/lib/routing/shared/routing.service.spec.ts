import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';

import { RoutingService } from './routing.service';
import { provideRoutingSourceService } from './routing-source.service';
import { FeatureService } from '../../feature';
import { provideOsrmRoutingSource } from '../routing-sources';


describe('RoutingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot()
      ],
      providers: [
        FeatureService,
        provideRoutingSourceService(),
        provideOsrmRoutingSource(),
        RoutingService,
      ]
    });
  });

  it('should ...', inject([RoutingService], (service: RoutingService) => {
    expect(service).toBeTruthy();
  }));
});
