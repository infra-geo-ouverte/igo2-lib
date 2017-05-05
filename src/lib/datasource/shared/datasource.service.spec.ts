import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RequestService, MessageService } from '../../core';

import { CapabilitiesService } from './capabilities.service';
import { DataSourceService } from './datasource.service';


describe('DataSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        RequestService,
        MessageService,
        CapabilitiesService,
        DataSourceService
      ]
    });
  });

  it('should ...', inject([DataSourceService], (service: DataSourceService) => {
    expect(service).toBeTruthy();
  }));

});
