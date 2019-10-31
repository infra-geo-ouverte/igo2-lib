import * as olproj from 'ol/proj';
import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { MAC } from 'ol/has';

import { MapViewState } from './map.interface';
import proj4 from 'proj4';

/**
 * This method extracts a coordinate tuple from a string.
 * @param str Any string
 * @param mapProjection string Map Projection
 * @returns object:
 *             lonLat: Coordinate,
 *             message: Message of error,
 *             radius: radius of the confience of coordinate,
 *             conf: confidence of the coordinate}
 */
export function stringToLonLat(str: string, mapProjection: string): {lonLat: [number, number] | undefined,
                                                                     message: string,
                                                                     radius: number | undefined,
                                                                     conf: number | undefined} {

  let lonLat: [number, number];
  let coordStr: string;
  let negativeLon: string;
  let degreesLon: string;
  let minutesLon: string;
  let secondsLon: string;
  let directionLon: string;
  let decimalLon: string;
  let negativeLat: string;
  let degreesLat: string;
  let minutesLat: string;
  let secondsLat: string;
  let directionLat: string;
  let decimalLat: string;
  let pattern: string;
  let zone: string;
  let radius: string;
  let conf: string;
  let lon: any;
  let lat: any;

  const projectionPattern = '(;[\\d]{4,6})';
  const toProjection = '4326';
  let projectionStr: string;
  const projectionRegex = new RegExp(projectionPattern, 'g');

  const lonlatCoord =  '([-+])?([\\d]{1,3})([,.](\\d+))?';
  const lonLatPattern = `${lonlatCoord}[\\s,.]\\s*${lonlatCoord}`;
  const lonLatRegex = new RegExp(`^${lonLatPattern}$`, 'g');

  const dmsCoord = '([0-9]{1,2})[:|°]?\\s*([0-9]{1,2})?[:|\'|′|’]?\\s*([0-9]{1,2}(?:\.[0-9]+){0,1})?\\s*["|″|”]?\\s*';
  const dmsCoordPattern = `${dmsCoord}([N|S]),?\\s*${dmsCoord}([E|W])`;
  const dmsRegex = new RegExp(`^${dmsCoordPattern}`, 'gi');

  const patternUtm = '(UTM)\-?(\\d{1,2})[\\s,.]*(\\d+[\\s.,]?\\d+)[\\s,.]+(\\d+[\\s.,]?\\d+)';
  const utmRegex =  new RegExp(`^${patternUtm}`, 'gi');

  const patternMtm = '(MTM)\-?(\\d{1,2})[\\s,.]*(\\d+[\\s.,]?\\d+)[\\s,.]+(\\d+[\\s.,]?\\d+)';
  const mtmRegex =  new RegExp(`^${patternMtm}`, 'gi');

  const ddCoord = '([-+])?(\\d{1,3})[,.](\\d+)';
  const patternDd = `${ddCoord}[,.]?\\s*${ddCoord}`;
  const ddRegex =  new RegExp(`^${patternDd}`, 'g');

  const dmdCoord = '([-+])?(\\d{1,3})[\\s,.]{1}(\\d{1,2})[\\s,.]{1}(\\d{1,2})[.,]?(\\d{1,5})?';
  const patternDmd = `${dmdCoord}[,.]?\\s*${dmdCoord}`;
  const dmdRegex =  new RegExp(`^${patternDmd}`, 'g');

  // tslint:disable:max-line-length
  const patternBELL = 'LAT\\s*[\\s:]*\\s*([-+])?(\\d{1,2})[\\s.,]?(\\d+)?[\\s.,]?\\s*(\\d{1,2}([.,]\\d+)?)?\\s*(N|S|E|W)?\\s*LONG\\s*[\\s:]*\\s*([-+])?(\\d{1,3})[\\s.,]?(\\d+)?[\\s.,]?\\s*(\\d{1,2}([.,]\\d+)?)?\\s*(N|S|E|W)?\\s*UNC\\s*[\\s:]?\\s*(\\d+)\\s*CONF\\s*[\\s:]?\\s*(\\d{1,3})';
  const bellRegex =  new RegExp(`^${patternBELL}?`, 'gi');

  const mmCoord = '([-+]?\\d+)[,.]?(\\d+)?';
  const mmPattern = `${mmCoord}[\\s,.]\\s*${mmCoord}`;
  const mmRegex =  new RegExp(`^${mmPattern}$`, 'g');

  let isXYCoords = false;

  str = str.toLocaleUpperCase().trim();
  // Extract projection
  if (projectionRegex.test(str)) {
    [coordStr, projectionStr] = str.split(';');
  } else {
    coordStr = str;
  }

  if (lonLatRegex.test(coordStr)) {

    [,
     negativeLon,
     lon,
     ,
     decimalLon,
     negativeLat,
     lat,
     ,
     decimalLat] = coordStr.match(lonLatPattern);

    lon = parseFloat((negativeLon ? negativeLon : '') + lon + '.' + decimalLon);
    lat = parseFloat((negativeLat ? negativeLat : '') + lat + '.' + decimalLat);

  } else if (dmsRegex.test(coordStr)) {
      [,
       degreesLon,
       minutesLon,
       secondsLon,
       directionLon,
       degreesLat,
       minutesLat,
       secondsLat,
       directionLat] = coordStr.match(dmsCoordPattern);

      lon = convertDMSToDD(parseFloat(degreesLon), parseFloat(minutesLon), parseFloat(secondsLon), directionLon);
      lat = convertDMSToDD(parseFloat(degreesLat), parseFloat(minutesLat), parseFloat(secondsLat), directionLat);

  } else if (utmRegex.test(coordStr)) {
    isXYCoords = true;
    [, pattern, zone, lon, lat] = coordStr.match(patternUtm);
    const utm = '+proj=' + pattern + ' +zone=' + zone;
    const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
    [lon, lat] = proj4(utm.toLocaleLowerCase(), wgs84, [parseFloat(lon), parseFloat(lat)]);

  } else if (mtmRegex.test(coordStr)) {
    isXYCoords = true;
    [, pattern, zone, lon, lat] = coordStr.match(patternMtm);
    let lon0;
    if (Number(zone) <= 2) {
      lon0 = -50 - Number(zone) * 3;
    } else if (Number(zone) >= 12) {
      lon0 = -81 - (Number(zone) - 12) * 3;
    } else {
      lon0 = -49.5 - Number(zone) * 3;
    }
    const mtm = `+proj=tmerc +lat_0=0 +lon_0=${lon0} +k=0.9999 +x_0=304800 +y_0=0 +ellps=GRS80 +units=m +no_defs`;
    const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
    [lon, lat] = proj4(mtm, wgs84, [parseFloat(lon), parseFloat(lat)]);

  } else if (dmdRegex.test(coordStr)) {
    [,
      negativeLon,
      degreesLon,
      minutesLon,
      secondsLon,
      decimalLon,
      negativeLat,
      degreesLat,
      minutesLat,
      secondsLat,
      decimalLat] = coordStr.match(patternDmd);

    lon = convertDMSToDD(parseFloat((negativeLon ? negativeLon : '') + degreesLon), parseFloat(minutesLon), parseFloat(secondsLon), directionLon);
    lat = convertDMSToDD(parseFloat((negativeLat ? negativeLat : '') + degreesLat), parseFloat(minutesLat), parseFloat(secondsLat), directionLat);

  } else if (ddRegex.test(coordStr)) {
      [,
        negativeLon,
        degreesLon,
        decimalLon,
        negativeLat,
        degreesLat,
        decimalLat] = coordStr.match(patternDd);

      lon = convertDMSToDD(parseFloat((negativeLon ? negativeLon : '') + degreesLon), parseFloat(minutesLon), parseFloat(secondsLon), directionLon);
      lat = convertDMSToDD(parseFloat((negativeLat ? negativeLat : '') + degreesLat), parseFloat(minutesLat), parseFloat(secondsLat), directionLat);

  } else if (bellRegex.test(coordStr)) {
    [,
      negativeLat,
      degreesLat,
      minutesLat,
      secondsLat,
      ,
      directionLat,
      negativeLon,
      degreesLon,
      minutesLon,
      secondsLon,
      ,
      directionLon,
      radius,
      conf] = coordStr.match(patternBELL);

    // Set default value for North America
    if (!directionLon) {
      directionLon = 'W';
    }

    // Check if real minutes or decimals
    if (minutesLon && minutesLon.length > 2) {
      lon = parseFloat((negativeLon ? negativeLon : '') + degreesLon + '.' + minutesLon);
    } else {
      lon = convertDMSToDD(parseFloat(degreesLon), parseFloat(minutesLon), parseFloat(secondsLon), directionLon);
    }

    if (minutesLat && minutesLat.length > 2) {
      lat = parseFloat((negativeLat ? negativeLat : '') + degreesLat + '.' + minutesLat);
    } else {
      lat = convertDMSToDD(parseFloat(degreesLat), parseFloat(minutesLat), parseFloat(secondsLat), directionLat);
    }

  } else if (mmRegex.test(coordStr)) {
      isXYCoords = true;
      [, lon, decimalLon, lat, decimalLat] = coordStr.match(mmPattern);

      if (decimalLon) {
        lon = parseFloat(lon + '.' + decimalLon);
      }

      if (decimalLat) {
        lat = parseFloat(lat + '.' + decimalLat);
      }

  } else {
    return {lonLat: undefined, message: '', radius: undefined, conf: undefined};
  }

  if (!isXYCoords) {
    // Set a negative coordinate for North America zone
    if (lon > 0 && lat > 0) {
      if (lon > lat) {
        lon = -lon;
      } else {
        lat = -lat;
      }
    }

    // Reverse coordinate to respect lonLat convention
    if (lon < lat) {
      lonLat = [lon, lat] as [number, number];
    } else {
      lonLat = [lat, lon] as [number, number];
    }
  } else {
    lonLat = [lon, lat] as [number, number];
  }

  // Reproject the coordinate if projection parameter have been set and coord is not 4326
  if ((projectionStr !== undefined && projectionStr !== toProjection) || (lonLat[0] > 180 || lonLat[0] < -180)) {

    const source = projectionStr ? 'EPSG:' + projectionStr : mapProjection;
    const dest = 'EPSG:' + toProjection;

    try {
      lonLat = olproj.transform(lonLat, source, dest);
    } catch (e) {
      return {lonLat: undefined, message: 'Projection ' + source + ' not supported', radius: undefined, conf: undefined};
    }
  }

  return {lonLat, message: '', radius: radius ? parseInt(radius, 10) : undefined, conf: conf ? parseInt(conf, 10) : undefined};
}

/**
 * Convert degrees minutes seconds to dd
 * @param degrees Degrees
 * @param minutes Minutes
 * @param seconds Seconds
 * @param direction Direction
 */
function convertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string) {
  minutes = minutes || 0;
  seconds = seconds || 0;
  let dd = degrees + (minutes / 60) + (seconds / 3600);

  if (direction === 'S' || direction === 'W') {
      dd = -dd;
  } // Don't do anything for N or E
  return dd;
}

/**
 * Return true of two view states are equal.
 * @param state1 View state
 * @param state2 View state
 * @returns True if the view states are equal
 */
export function viewStatesAreEqual(state1: MapViewState, state2: MapViewState): boolean {
  if (state1 === undefined || state2 === undefined) {
    return false;
  }

  const tolerance = 1 / 10000;
  return state1.zoom === state2.zoom &&
    Math.trunc(state1.center[0] / tolerance) === Math.trunc(state2.center[0] / tolerance) &&
    Math.trunc(state1.center[1] / tolerance) === Math.trunc(state2.center[1] / tolerance);
}

/**
 * Format the scale to a human readable text
 * @param Scale of the map
 * @returns Human readable scale text
 */
export function formatScale(scale) {
  scale = Math.round(scale);
  if (scale < 10000) { return scale + ''; }

  scale = Math.round(scale / 1000);
  if (scale < 1000) { return scale + 'K'; }

  scale = Math.round(scale / 1000);
  return scale + 'M';
}

/**
 * Return the resolution from a scale denom
 * @param scale Scale denom
 * @param dpi DPI
 * @returns Resolution
 */
export function getResolutionFromScale(scale: number, dpi: number = 96): number {
  const inchesPerMeter = 39.3701;
  return scale / (inchesPerMeter * dpi);
}

/**
 * Return the resolution from a scale denom
 * @param Scale denom
 * @returns Resolution
 */
export function getScaleFromResolution(resolution: number, unit: string = 'm', dpi: number = 96): number {
  const inchesPerMeter = 39.3701;
  return resolution * olproj.METERS_PER_UNIT[unit] * inchesPerMeter * dpi;
}

/**
 * Returns true if the CTRL key is pushed during an Ol MapBrowserPointerEvent
 * @param event OL MapBrowserPointerEvent
 * @returns Whether the CTRL key is pushed
 */
export function ctrlKeyDown(event: OlMapBrowserPointerEvent): boolean {
  const originalEvent = event.originalEvent;
  return (
    !originalEvent.altKey &&
    (MAC ? originalEvent.metaKey : originalEvent.ctrlKey) &&
    !originalEvent.shiftKey
  );
}
