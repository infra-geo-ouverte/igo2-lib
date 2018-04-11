import { TestBed, inject } from '@angular/core/testing';

import { IgoCoreModule } from '../../core';
import { MapService } from '../../map';
import { WktService } from './wkt.service';

describe('WktService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot()
      ],
      providers: [
        WktService,
        MapService
      ]
    });
  });

  it('should ...', inject([WktService], (service: WktService) => {
    expect(service).toBeTruthy();
  }));
});
