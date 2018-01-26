import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';

import { CapabilitiesService } from './capabilities.service';
import { DataSourceService } from './datasource.service';


describe('DataSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [
        CapabilitiesService,
        DataSourceService
      ]
    });
  });

  it('should ...', inject([DataSourceService], (service: DataSourceService) => {
    expect(service).toBeTruthy();
  }));

});
