import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { CapabilitiesService } from './capabilities.service';
import { DataSourceService } from './datasource.service';
import { WFSDataSourceService } from './datasources/wfs-datasource.service';


describe('DataSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        CapabilitiesService,
        DataSourceService,
        WFSDataSourceService
      ]
    });
  });

  it('should ...', inject([DataSourceService], (service: DataSourceService) => {
    expect(service).toBeTruthy();
  }));

});
