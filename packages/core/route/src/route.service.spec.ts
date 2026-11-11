import { TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { RouteService } from './route.service';

describe('RouteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ zoom: 8 })
          }
        }
      ]
    });
  });

  it('should create the service', inject(
    [RouteService],
    (service: RouteService) => {
      expect(service).toBeTruthy();
    }
  ));
});
