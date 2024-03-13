import { Observable, from } from 'rxjs';

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
/**
 * Method allowing to read the file and try to detect projection/Coord system
 * Only geojson/json/gml could be detected at this moment.
 * @param options A file and an optional number of line to read the EPSG Code. Used only for GML files
 * @returns Observable string, epsgNotDefined if the EPSG is not detected or a EPSG string ex: EPSG:3857
 */
export function detectFileEPSG(options: {
  file: File;
  nbLines?: number;
}): Observable<string> {
  const file = options.file;
  const nbLines = options.nbLines ?? 500;

  const reader = new FileReader();
  return from(
    new Promise<string>((resolve) => {
      if (
        !file.name.toLowerCase().endsWith('.geojson') &&
        !file.name.toLowerCase().endsWith('.json') &&
        !file.name.toLowerCase().endsWith('.gml')
      ) {
        resolve('epsgNotDefined');
        return;
      }

      reader.onload = (e) => {
        if (
          file.name.toLowerCase().endsWith('.geojson') ||
          file.name.toLowerCase().endsWith('.json')
        ) {
          const geojson = JSON.parse(reader.result as string);
          if (geojson.crs?.properties?.name) {
            const epsg =
              geojson.crs.properties.name.match(/EPSG:{1,2}\d{0,6}/gm);
            if (epsg !== null && epsg.length) {
              resolve(epsg[0].replace(/::/g, ':'));
              return;
            } else {
              resolve('epsgNotDefined');
              return;
            }
          } else {
            resolve('epsgNotDefined');
            return;
          }
        } else if (file.name.toLowerCase().endsWith('.gml')) {
          const text = reader.result as string;
          const lines = (text as string).split('\n');
          for (let line = 0; line <= nbLines; line++) {
            const epsg = lines[line].match(/EPSG:\d{0,6}/gm);
            if (epsg !== null && epsg.length) {
              resolve(epsg[0]);
              break;
            } else {
              resolve(undefined);
            }
          }
        } else {
          resolve('epsgNotDefined');
        }
      };
      reader.readAsText(file, 'UTF-8');
    })
  );
}
