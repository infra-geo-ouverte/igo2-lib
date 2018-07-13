import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { FeatureService } from './feature.service';

describe('FeatureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        FeatureService
      ]
    });
  });

  it('should ...', inject([FeatureService], (service: FeatureService) => {
    expect(service).toBeTruthy();
  }));
});
