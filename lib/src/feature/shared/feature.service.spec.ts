import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { FeatureService } from './feature.service';

describe('FeatureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        JsonpModule
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
