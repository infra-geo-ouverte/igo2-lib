import { TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { RouteService } from './route.service';

describe('RouteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ zoom: 8 })
          }
        },
        RouteService
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
