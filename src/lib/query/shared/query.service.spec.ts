import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { ActivityService, RequestService, MessageService } from '../../core';
import { FeatureService } from '../../feature';

import { QueryService } from './query.service';

describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        ActivityService,
        RequestService,
        MessageService,
        FeatureService,
        QueryService
      ]
    });
  });

  it('should ...', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});
