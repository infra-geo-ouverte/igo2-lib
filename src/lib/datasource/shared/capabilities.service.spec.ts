import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';

import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [
        CapabilitiesService
      ]
    });
  });

  it('should ...', inject([CapabilitiesService], (service: CapabilitiesService) => {
    expect(service).toBeTruthy();
  }));
});
