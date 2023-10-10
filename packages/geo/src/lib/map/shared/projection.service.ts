import { Injectable } from '@angular/core';

import proj4 from 'proj4';
import * as olproj from 'ol/proj';
import * as olproj4 from 'ol/proj/proj4';

import { ConfigService } from '@igo2/core';

import { Projection } from './projection.interfaces';

/**
 * When injected, this service automatically registers and
 * projection defined in the application config. A custom projection
 * needs to be registered to be usable by OL.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectionService {
  constructor(private config: ConfigService) {
    const projections: Projection[] =
      this.config.getConfig('projections') || [];
    projections.forEach((projection) => {
      projection.alias = projection.alias ? projection.alias : projection.code;
      this.registerProjection(projection);
    });

    // register all utm zones
    for (let utmZone = 1; utmZone < 61; utmZone++) {
      const code = utmZone < 10 ? `EPSG:3260${utmZone}` : `EPSG:326${utmZone}`;
      const def = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
      const proj: Projection = { code, def, extent: undefined };
      this.registerProjection(proj);
    }

    // register all mtm zones
    for (let mtmZone = 1; mtmZone < 11; mtmZone++) {
      const code =
        mtmZone < 10 ? `EPSG:3218${mtmZone}` : `EPSG:321${80 + mtmZone}`;
      let lon0;
      if (Number(mtmZone) <= 2) {
        lon0 = -50 - Number(mtmZone) * 3;
      } else if (Number(mtmZone) >= 12) {
        lon0 = -81 - (Number(mtmZone) - 12) * 3;
      } else {
        lon0 = -49.5 - Number(mtmZone) * 3;
      }
      const def = `+proj=tmerc +lat_0=0 +lon_0=${lon0} +k=0.9999 +x_0=304800 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"`;
      const proj: Projection = { code, def, extent: undefined };
      this.registerProjection(proj);
    }
  }

  /**
   * Define a proj4 projection and register it in OL
   * @param projection Projection
   */
  registerProjection(projection: Projection) {
    proj4.defs(projection.code, projection.def);
    olproj4.register(proj4);
    if (projection.extent) {
      olproj.get(projection.code).setExtent(projection.extent);
    }
  }
}
