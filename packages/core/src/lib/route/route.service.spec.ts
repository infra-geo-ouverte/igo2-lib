import { TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { RouteService } from './route.service';

describe('RouteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ zoom: 8 })
          }
        },
        RouteService
      ]
    });
  });

  it('should ...', inject([RouteService], (service: RouteService) => {
    expect(service).toBeTruthy();
  }));
});
