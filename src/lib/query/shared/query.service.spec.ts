import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';
import { FeatureService } from '../../feature';

import { QueryService } from './query.service';

describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [
        FeatureService,
        QueryService
      ]
    });
  });

  it('should ...', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});
