import { Injectable } from '@angular/core';

import * as olproj from 'ol/proj';
import olWKT from 'ol/format/WKT';

@Injectable({
  providedIn: 'root'
})
export class WktService {
  constructor() {}

  public wktToFeature(wkt, wktProj, featureProj = 'EPSG:3857') {
    return new olWKT().readFeature(wkt, {
      dataProjection: wktProj,
      featureProjection: featureProj
    });
  }
  public extentToWkt(epsgTO, extent, extentProj) {
    let currentExtent = olproj.transformExtent(extent, extentProj, epsgTO);
    currentExtent = this.roundCoordinateArray(currentExtent, epsgTO, 0);
    const wktPoly = `POLYGON((
      ${extent[0]} ${extent[1]},
      ${extent[0]} ${extent[3]},
      ${extent[2]} ${extent[3]},
      ${extent[2]} ${extent[1]},
      ${extent[0]} ${extent[1]}))`;
    const wktLine = `LINESTRING(
      ${extent[0]} ${extent[1]},
      ${extent[0]} ${extent[3]},
      ${extent[2]} ${extent[3]},
      ${extent[2]} ${extent[1]},
      ${extent[0]} ${extent[1]})`;
    const wktMultiPoints = `MULTIPOINT(
        ${extent[0]} ${extent[1]},
        ${extent[0]} ${extent[3]},
        ${extent[2]} ${extent[3]},
        ${extent[2]} ${extent[1]})`;
    return {
      wktPoly: wktPoly,
      wktLine: wktLine,
      wktMultiPoints: wktMultiPoints
    };
  }

  private roundCoordinateArray(coordinateArray, projection, decimal = 0) {
    const lproj = olproj.get(projection);
    const units = lproj.getUnits();
    const olUnits = ['ft', 'm', 'us-ft'];
    if (olUnits.indexOf(units) !== -1) {
      coordinateArray = this.roundArray(coordinateArray, decimal);
    }
    return coordinateArray;
  }

  private roundArray(array, decimal = 0) {
    let x = 0;
    while (x < array.length) {
      array[x] = array[x].toFixed(decimal);
      x++;
    }
    return array;
  }

  public snrcToWkt(snrc, epsgTO = 'EPSG:3857') {
    snrc = snrc.toLowerCase();
    let wktPoly;
    const ew = {
      '1': { from: -56, to: -64 },
      '2': { from: -64, to: -72 },
      '3': { from: -72, to: -80 },
      '4': { from: -80, to: -88 },
      '5': { from: -88, to: -96 },
      '6': { from: -96, to: -104 },
      '7': { from: -104, to: -112 },
      '8': { from: -112, to: -120 },
      '9': { from: -120, to: -128 },
      '10': { from: -128, to: -136 }
    };
    const sn = {
      '1': { from: 44, to: 48 },
      '2': { from: 48, to: 52 },
      '3': { from: 52, to: 56 },
      '4': { from: 56, to: 60 },
      '5': { from: 60, to: 64 },
      '6': { from: 64, to: 68 },
      '7': { from: 68, to: 72 },
      '8': { from: 72, to: 76 },
      '9': { from: 76, to: -128 }
    };
    const snrc250kIndex = [
      ['m', 'n', 'o', 'p'],
      ['l', 'k', 'j', 'i'],
      ['e', 'f', 'g', 'h'],
      ['d', 'c', 'b', 'a']
    ];

    const snrc50kIndex = [
      ['13', '14', '15', '16'],
      ['12', '11', '10', '09'],
      ['05', '06', '07', '08'],
      ['04', '03', '02', '01']
    ];
    const checkSNRC50k = /\d{2,3}[a-p][0,1][0-9]/gi;
    const checkSNRC250k = /\d{2,3}[a-p]/gi;
    const checkSNRC1m = /\d{2,3}/gi;

    let snrc1m = false;
    let snrc250k = false;
    let snrc50k = false;

    if (checkSNRC50k.test(snrc)) {
      snrc50k = true;
    } else {
      if (checkSNRC250k.test(snrc)) {
        snrc250k = true;
      } else {
        if (checkSNRC1m.test(snrc)) {
          snrc1m = true;
        }
      }
    }

    if (snrc1m) {
      snrc += 'a01';
    } else if (snrc250k) {
      snrc += '01';
    }
    if (/\d{2,3}[a-p][0,1][0-9]/gi.test(snrc)) {
      const regex_1m = /(?=[a-p])/gi;
      const ar1m = snrc.split(regex_1m);
      const part1m = ar1m[0];
      const part250k = ar1m[1][0];
      const part50k = ar1m[1].split(part250k)[1];
      let separator = 1;
      if (part1m.length === 3) {
        separator = 2;
      }
      const partEW = part1m.substring(0, separator);
      const partSN = part1m.substring(separator);
      const unit1m_EW = 8;
      const unit1m_SN = 4;
      const unit250k_EW = 2;
      const unit250k_SN = 1;
      const unit50k_EW = 0.5;
      const unit50k_SN = 0.25;
      let index250k_EW = 0;
      let index250k_SN = 0;
      let index50k_EW = 0;
      let index50k_SN = 0;
      snrc250kIndex.forEach(element => {
        if (element.indexOf(part250k) !== -1) {
          index250k_SN = snrc250kIndex.indexOf(element);
          index250k_EW = element.indexOf(part250k);
        }
      });
      snrc50kIndex.forEach(element => {
        if (element.indexOf(part50k) !== -1) {
          index50k_SN = snrc50kIndex.indexOf(element);
          index50k_EW = element.indexOf(part50k);
        }
      });

      let increment250k_EW = 0;
      let increment250k_SN = 0;
      let increment50k_EW = 0;
      let increment50k_SN = 0;
      let unitPerType_EW = unit1m_EW;
      let unitPerType_SN = unit1m_SN;
      if (snrc250k) {
        increment250k_EW = index250k_EW * unit250k_EW;
        increment250k_SN = index250k_SN * unit250k_SN;
        increment50k_EW = 0;
        increment50k_SN = 0;
        unitPerType_EW = unit250k_EW;
        unitPerType_SN = unit250k_SN;
      } else if (snrc50k) {
        increment250k_EW = index250k_EW * unit250k_EW;
        increment250k_SN = index250k_SN * unit250k_SN;
        increment50k_EW = index50k_EW * unit50k_EW;
        increment50k_SN = index50k_SN * unit50k_SN;
        unitPerType_EW = unit50k_EW;
        unitPerType_SN = unit50k_SN;
      }

      const coord = {
        ul: [
          ew[partEW].to + increment250k_EW + increment50k_EW,
          sn[partSN].to - increment250k_SN - increment50k_SN
        ]
      };

      coord['lr'] = [
        coord['ul'][0] + unitPerType_EW,
        coord['ul'][1] - unitPerType_SN
      ];
      coord['ur'] = [coord['ul'][0], coord['ul'][1] - unitPerType_SN];
      coord['ll'] = [coord['ul'][0] + unitPerType_EW, coord['ul'][1]];

      coord.ul = olproj.transform(
        [coord.ul[0], coord.ul[1]],
        'EPSG:4326',
        epsgTO
      );
      coord['lr'] = olproj.transform(
        [coord['lr'][0], coord['lr'][1]],
        'EPSG:4326',
        epsgTO
      );
      coord['ur'] = olproj.transform(
        [coord['ur'][0], coord['ur'][1]],
        'EPSG:4326',
        epsgTO
      );
      coord['ll'] = olproj.transform(
        [coord['ll'][0], coord['ll'][1]],
        'EPSG:4326',
        epsgTO
      );

      // Rounded coordinate to shorten url in get
      coord['ul'] = this.roundCoordinateArray(coord['ul'], epsgTO, 0);
      coord['lr'] = this.roundCoordinateArray(coord['lr'], epsgTO, 0);
      coord['ur'] = this.roundCoordinateArray(coord['ur'], epsgTO, 0);
      coord['ll'] = this.roundCoordinateArray(coord['ll'], epsgTO, 0);

      wktPoly =
        'POLYGON((' +
        [
          coord.ul.join(' '),
          coord['ur'].join(' '),
          coord['lr'].join(' '),
          coord['ll'].join(' '),
          coord.ul.join(' ')
        ].join(',') +
        '))';
      const wktLine =
        'LINESTRING(' +
        [
          coord.ul.join(' '),
          coord['ur'].join(' '),
          coord['lr'].join(' '),
          coord['ll'].join(' '),
          coord.ul.join(' ')
        ].join(',') +
        ')';

      const wktMultiPoints =
        'MULTIPOINT(' +
        [
          coord.ul.join(' '),
          coord['ur'].join(' '),
          coord['lr'].join(' '),
          coord['ll'].join(' ')
        ].join(',') +
        ')';
      return {
        wktPoly: wktPoly,
        wktLine: wktLine,
        wktMultiPoints: wktMultiPoints
      };
    }
  }
}
