import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';

import * as olproj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

import { Projection } from './projection.interfaces';
import { provideProjection } from './projection.provider';
import { ProjectionService } from './projection.service';

describe('ProjectionService', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('can be instantiated without ConfigService', () => {
    TestBed.configureTestingModule({
      providers: [ProjectionService]
    });

    expect(TestBed.inject(ProjectionService)).toBeInstanceOf(ProjectionService);
  });

  it('registers projections provided through provideProjection', () => {
    const projection: Projection = {
      code: 'EPSG:99990',
      def: '+proj=longlat +datum=WGS84 +no_defs'
    };

    TestBed.configureTestingModule({
      providers: [provideProjection({ projections: [projection] })]
    });

    TestBed.inject(ProjectionService);

    expect(projection.alias).toBe(projection.code);
    expect(olproj.get(projection.code)).not.toBeNull();
  });

  it('registers configured projections after configuration is loaded', () => {
    const isLoaded$ = new BehaviorSubject(false);
    const projection: Projection = {
      code: 'EPSG:99991',
      def: '+proj=longlat +datum=WGS84 +no_defs'
    };
    let configRead = false;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            isLoaded$,
            getConfig: () => {
              configRead = true;
              return [projection];
            }
          }
        }
      ]
    });

    TestBed.inject(ProjectionService);
    expect(configRead).toBe(false);

    isLoaded$.next(true);

    expect(configRead).toBe(true);
    expect(projection.alias).toBe(projection.code);
    expect(olproj.get(projection.code)).not.toBeNull();
  });
});
