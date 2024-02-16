import { BehaviorSubject } from 'rxjs';

import { ProjectionsLimitationsOptions } from './projection.interfaces';

/**
 * Return a number of zone MTM for a longitude for province of Quebec only
 * @param lon number
 * @returns zone
 */
export function zoneMtm(lon: number): number {
  let lonMin = -54;
  const lonMax = -81;
  if (lon < lonMax || lon > lonMin) {
    return 0;
  } else {
    const deltaLon = 3;
    let zone = 2;
    while (Math.abs(lon - lonMin) > deltaLon) {
      lonMin = lonMin - deltaLon;
      zone++;
    }
    return zone;
  }
}
/**
 * Return a number of zone UTM for a longitude
 * @param lon number
 * @returns zone
 */
export function zoneUtm(lon: number): number {
  let lonMin = -180;
  const lonMax = 180;
  const deltaLon = 6;
  let zone = 1;
  while (Math.abs(lon - lonMin) > deltaLon) {
    lonMin = lonMin + deltaLon;
    zone++;
  }
  return zone;
}

/**
 * Compute the contraints of projections
 * @param projectionsLimitations: ProjectionsLimitationsOptions
 * @returns projectionsContraints: ProjectionsLimitationsOptions
 */
export function computeProjectionsConstraints(
  projectionsLimitations: ProjectionsLimitationsOptions
): ProjectionsLimitationsOptions {
  const mtmZone = projectionsLimitations.mtmZone;
  const utmZone = projectionsLimitations.utmZone;
  const projectionsConstraints = {
    projFromConfig:
      projectionsLimitations.projFromConfig === false ? false : true,
    nad83: projectionsLimitations.nad83 === false ? false : true,
    wgs84: projectionsLimitations.wgs84 === false ? false : true,
    webMercator: projectionsLimitations.webMercator === false ? false : true,
    utm: projectionsLimitations.utm === false ? false : true,
    mtm: projectionsLimitations.mtm === false ? false : true,
    utmZone: {
      minZone: utmZone && utmZone.minZone ? utmZone.minZone : 17,
      maxZone: utmZone && utmZone.maxZone ? utmZone.maxZone : 21
    },
    mtmZone: {
      minZone: mtmZone && mtmZone.minZone ? mtmZone.minZone : 2,
      maxZone: mtmZone && mtmZone.maxZone ? mtmZone.maxZone : 10
    }
  };
  return projectionsConstraints;
}

export function detectFileEPSG(options: {
  file: File;
  epsgCode$: BehaviorSubject<string>;
  nbLines?: number;
}) {
  const file = options.file;
  const epsgCode$ = options.epsgCode$;
  const nbLines = options.nbLines ?? 500;

  if (
    !file.name.toLowerCase().endsWith('.geojson') &&
    !file.name.toLowerCase().endsWith('.json') &&
    !file.name.toLowerCase().endsWith('.gml')
  ) {
    epsgCode$.next('epsgNotDefined');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (
      file.name.toLowerCase().endsWith('.geojson') ||
      file.name.toLowerCase().endsWith('.json')
    ) {
      const geojson = JSON.parse(reader.result as string);
      if (geojson.crs?.properties?.name) {
        const epsg = geojson.crs.properties.name.match(/EPSG:{1,2}\d{0,6}/gm);
        if (epsg !== null && epsg.length) {
          epsgCode$.next(epsg[0].replace(/::/g, ':'));
          return;
        } else {
          epsgCode$.next('epsgNotDefined');
          return;
        }
      } else {
        epsgCode$.next('epsgNotDefined');
        return;
      }
    } else if (file.name.toLowerCase().endsWith('.gml')) {
      const text = reader.result as string;
      const lines = (text as string).split('\n');
      for (let line = 0; line <= nbLines; line++) {
        const epsg = lines[line].match(/EPSG:\d{0,6}/gm);
        if (epsg !== null && epsg.length) {
          epsgCode$.next(epsg[0]);
          break;
        } else {
          epsgCode$.next(undefined);
          return;
        }
      }
    } else {
      epsgCode$.next('epsgNotDefined');
      return;
    }
  };
  reader.readAsText(file, 'UTF-8');
}
