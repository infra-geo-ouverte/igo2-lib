import OlFeature from 'ol/Feature';
import { asArray as ColorAsArray, toString } from 'ol/color';
import { getCenter } from 'ol/extent';
import type { default as OlGeometry, Type } from 'ol/geom/Geometry';
import olPoint from 'ol/geom/Point';
import RenderFeature from 'ol/render/Feature';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style, { StyleFunction, StyleLike } from 'ol/style/Style';
import Text from 'ol/style/Text';
import { FlatStyleLike, Rule } from 'ol/style/flat';

import { Style as GsStyle, Symbolizer } from 'geostyler-style';

import { featuresAreTooDeepInView } from '../../../feature/shared/feature.utils';
import { ClusterParam } from '../../../layer/shared/clusterParam';
import { IgoMap } from '../../../map/shared/map';
import { LayerStyle, OlStyleLikeOrFlatLike } from './layer-style.interface';

/** Instance ol/style/Style */
export function isOlStyleInstance(obj: any): obj is Style {
  return obj instanceof Style;
}

export function isOlStyleInstanceArray(obj: any): obj is Style[] {
  return Array.isArray(obj) && obj.every(isOlStyleInstance);
}

export function isEditableLayerStyle(
  obj: any
): obj is LayerStyle & { editable: true } {
  if (!obj || typeof obj !== 'object') return false;
  return typeof obj.editable === 'boolean' && obj.editable === true;
}

/** StyleFunction : (feature, resolution) => Style | Style[] | undefined */
export function isStyleFunction(obj: any): obj is StyleLike {
  return typeof obj === 'function';
}

export function isFlatStyleLikeArray(obj: any): obj is Style[] {
  return Array.isArray(obj) && obj.every(isFlatStyleLike);
}

export function isFlatStyleLike(obj: any): obj is FlatStyleLike {
  if (!obj || typeof obj !== 'object') return false;
  const flatKeys = [
    'fill-color',
    'fill-opacity',
    'stroke-color',
    'stroke-width',
    'stroke-opacity',
    'circle-radius',
    'circle-fill-color',
    'icon-src',
    'icon-scale',
    'text-field',
    'text-font',
    'text-size',
    'zIndex',
    'renderer'
  ];
  return (
    flatKeys.some((k) => Object.prototype.hasOwnProperty.call(obj, k)) ||
    isFlatStyleLikeArray(obj) ||
    isRuleArray(obj)
  );
}

export function isRuleArray(obj: any): obj is Rule[] {
  return Array.isArray(obj) && obj.every(isRule);
}

function isRule(obj: any): obj is Rule {
  return (
    obj &&
    typeof obj === 'object' &&
    'style' in obj && // obligatoire
    (isFlatStyleLike(obj.style) ||
      (Array.isArray(obj.style) && obj.style.every(isFlatStyleLike)))
  );
}
/** StyleLike englobe généralement Style instance ou StyleFunction */
export function isStyleLike(obj: any): obj is StyleLike {
  if (!obj) return false;
  return (
    obj &&
    (isOlStyleInstance(obj) ||
      isOlStyleInstanceArray(obj) ||
      isStyleFunction(obj))
  );
}

export function isOlStyleLikeOrFlatLike(
  obj: any
): obj is OlStyleLikeOrFlatLike {
  if (!obj) return false;
  return isStyleLike(obj) || isFlatStyleLike(obj);
}

export function isGeostylerLayerStyle(
  value: unknown
): value is LayerStyle & { type: 'Geostyler'; style: GsStyle } {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as LayerStyle;
  return v?.type === 'Geostyler';
}

export function LayerQueryResultsOlStyleFunction(
  map?: IgoMap,
  type?: 'focus' | 'selection'
): StyleLike {
  return LayerSearchResultsOlStyleFunction(map, type);
}

export function LayerSearchResultsOlStyleFunction(
  map?: IgoMap,
  type?: 'focus' | 'selection'
): (olFeature: OlFeature<OlGeometry>, resolution: number) => Style[] {
  return (olFeature: OlFeature<OlGeometry>) => {
    const olProperties = olFeature.getProperties();
    const mapTitle = olProperties._mapTitle;
    let imposedGeometry: OlGeometry;
    if (map?.viewController) {
      const olGeometry = olFeature.getGeometry();
      const geomExtent = olGeometry.getExtent() as [
        number,
        number,
        number,
        number
      ];

      if (featuresAreTooDeepInView(map.viewController, geomExtent, 0.0025)) {
        imposedGeometry = new olPoint(getCenter(geomExtent));
      }
    }
    switch (type) {
      case 'focus':
        return LayerFocusOlStyle(mapTitle, imposedGeometry);
      case 'selection':
        return LayerSelectionOlStyle(mapTitle, imposedGeometry);
      default:
        return LayerBaseOlStyle(mapTitle, imposedGeometry);
    }
  };
}

export function LayerBaseOlStyle(
  text?: string,
  imposedGeometry?: OlGeometry
): Style[] {
  const baseStyle = new Style({
    fill: new Fill({
      color: 'rgba(0, 161, 222,0.15)'
    }),
    stroke: new Stroke({
      width: 2,
      color: 'rgba(0, 161, 222,0.5)'
    })
  });
  if (imposedGeometry) {
    baseStyle.setGeometry(imposedGeometry);
  }
  return [
    LayerMarkerOlStyle({
      text,
      markerColor: 'rgba(0, 161, 222, 0.5)',
      markerOutlineColor: 'rgba(255, 255, 255, 1)',
      imposedGeometry
    }),
    baseStyle
  ];
}

export function LayerFocusOlStyle(
  text?: string,
  imposedGeometry?: OlGeometry
): Style[] {
  const selectionStyle = new Style({
    fill: new Fill({
      color: 'rgba(207, 222, 0, 0.15)'
    }),
    stroke: new Stroke({
      width: 4,
      color: 'rgba(11, 220, 228, 0.5)'
    })
  });
  if (imposedGeometry) {
    selectionStyle.setGeometry(imposedGeometry);
  }
  return [
    LayerMarkerOlStyle({
      text,
      markerColor: 'rgba(207, 222, 0, 1)',
      markerOutlineColor: 'rgba(11, 220, 228, 1)',
      imposedGeometry
    }),
    selectionStyle
  ];
}

export function LayerSelectionOlStyle(
  text?: string,
  imposedGeometry?: OlGeometry
): Style[] {
  const selectionStyle = new Style({
    fill: new Fill({
      color: 'rgba(0, 161, 222, 0.15)'
    }),
    stroke: new Stroke({
      width: 4,
      color: 'rgba(0, 255, 255,0.5)'
    })
  });
  if (imposedGeometry) {
    selectionStyle.setGeometry(imposedGeometry);
  }
  return [
    LayerMarkerOlStyle({
      text,
      markerColor: 'rgba(0, 161, 222, 1)',
      markerOutlineColor: 'rgba(0, 255, 255, 1)',
      imposedGeometry
    }),
    selectionStyle
  ];
}

/**
 * Creates an OpenLayers style configured to be visually nearly transparent.
 *
 * The returned style uses a white fill and stroke with very low opacity (alpha ≈ 0.01)
 * and includes a circular image symbol (radius 5) with a matching near-transparent stroke.
 * This is useful for layers that need to participate in map interactions (e.g., hit testing,
 * event capture) while remaining effectively invisible to the user.
 *
 * @returns {StyleLike} An OpenLayers-compatible style (or style-like value) with
 *                      near-transparent fill, stroke, and circle image settings.
 */
export function LayerNearTransparentOlStyle(): Style {
  return new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.01)'
    }),
    stroke: new Stroke({
      width: 10,
      color: 'rgba(255, 255, 255, 0.01)'
    }),
    image: new Circle({
      stroke: new Stroke({
        width: 10,
        color: 'rgba(255, 255, 255, 0.01)'
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.01)'
      }),
      radius: 5
    })
  });
}

interface LayerMarkerOlStyleParams {
  text?: string;
  markerColor?: string;
  markerOutlineColor?: string;
  imposedGeometry?: OlGeometry;
}

export function LayerMarkerOlStyle({
  text,
  markerColor = 'rgba(0, 161, 222, 1)',
  markerOutlineColor = 'rgba(255, 255, 255, 1)',
  imposedGeometry
}: LayerMarkerOlStyleParams): Style {
  const svg = `data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="36" width="36" viewBox="0 0 36 36">
    <path fill="${toString(ColorAsArray(markerColor))}" stroke="${toString(ColorAsArray(markerOutlineColor))}" stroke-width="2" 
     d="M 17.692635,32.565644 C 15.71852,30.330584 13.290925,27.058065 11.6766,24.455732 9.3398623,20.688851 7.8905694,17.205334 7.6297492,14.728733 7.5616025,14.081649 7.5739557,12.528552 7.6513363,12.014724 8.1013861,9.0262716 9.8047068,6.3655569 12.310675,4.7364878 c 1.113691,-0.7239832 2.508083,-1.2834131 3.776687,-1.5152052 0.242945,-0.044389 0.451656,-0.09393 0.463804,-0.1100911 0.01215,-0.016161 0.638282,-0.025502 1.391411,-0.02076 1.088235,0.00685 1.450932,0.024316 1.766871,0.085071 2.650763,0.5097353 4.947142,1.8701891 6.498786,3.8501033 0.628018,0.8013587 1.297046,2.0200608 1.640967,2.9891872 0.191065,0.538399 0.427644,1.447408 0.477391,1.834287 0.0164,0.127546 0.0434,0.231902 0.06,0.231902 0.0166,0 0.03122,0.626135 0.03249,1.391411 0.0013,0.765276 -0.011,1.391411 -0.02726,1.391411 -0.01626,0 -0.05449,0.154049 -0.08495,0.342331 -0.08815,0.544879 -0.387235,1.721449 -0.604837,2.379406 -1.209421,3.656888 -4.014463,8.349762 -7.849521,13.132357 -0.790496,0.985807 -1.795217,2.167992 -1.842543,2.167992 -0.01896,0 -0.161766,-0.144111 -0.317336,-0.320246 z m 1.066937,-15.36525 c 0.133519,-0.02121 0.248766,-0.05657 0.256105,-0.07859 0.0073,-0.02202 0.04918,-0.03066 0.09298,-0.0192 0.0438,0.01145 0.107628,-0.0072 0.141834,-0.04137 0.03421,-0.03421 0.08456,-0.05474 0.111888,-0.04563 0.02733,0.0091 0.07703,-0.01077 0.110429,-0.04417 0.03341,-0.03341 0.08416,-0.05293 0.112796,-0.04338 0.02863,0.0095 0.08974,-0.01867 0.135802,-0.06271 0.04606,-0.04403 0.111902,-0.08625 0.146319,-0.09381 0.204084,-0.04483 0.762371,-0.519108 1.079463,-0.917027 0.26749,-0.335672 0.570987,-0.878795 0.529019,-0.946701 -0.01496,-0.0242 -0.0067,-0.044 0.01835,-0.044 0.05645,0 0.196809,-0.467982 0.158801,-0.529481 -0.01521,-0.02461 -0.0043,-0.04475 0.02427,-0.04475 0.03157,0 0.04365,-0.04329 0.03082,-0.11043 -0.01161,-0.06074 -0.0066,-0.110429 0.01124,-0.110429 0.01779,0 0.03235,-0.258405 0.03235,-0.574233 0,-0.315829 -0.01545,-0.574234 -0.03434,-0.574234 -0.01889,0 -0.02437,-0.03811 -0.01219,-0.08469 0.04412,-0.168712 -0.336329,-1.152668 -0.481536,-1.245401 -0.02327,-0.01486 -0.04022,-0.03992 -0.03765,-0.05568 0.01222,-0.07498 -0.156557,-0.318365 -0.406379,-0.586027 -0.295921,-0.317054 -0.773059,-0.690104 -0.83427,-0.652274 -0.0206,0.01273 -0.03745,0.0024 -0.03745,-0.02289 0,-0.06107 -0.433076,-0.2789369 -0.487546,-0.245273 -0.02338,0.01445 -0.04251,0.0068 -0.04251,-0.01695 0,-0.056281 -0.393995,-0.1865457 -0.613804,-0.2029397 -0.0943,-0.00703 -0.188579,-0.023183 -0.209503,-0.035888 -0.02092,-0.012705 -0.276571,-0.023337 -0.568105,-0.023627 -0.534044,-5.301e-4 -1.12638,0.091025 -1.12638,0.1741017 0,0.023781 -0.01713,0.032648 -0.03808,0.019705 -0.05054,-0.031232 -0.403641,0.1088602 -0.403641,0.1601422 0,0.02204 -0.01988,0.02779 -0.04417,0.01278 -0.0243,-0.01501 -0.04417,-0.0051 -0.04417,0.02209 0,0.02716 -0.01988,0.0371 -0.04417,0.02209 -0.0243,-0.01501 -0.04417,-0.0051 -0.04417,0.02209 0,0.02716 -0.01915,0.03755 -0.04256,0.02308 -0.02341,-0.01447 -0.08138,0.01252 -0.128834,0.05997 -0.04745,0.04745 -0.0974,0.07515 -0.111001,0.06155 -0.0136,-0.0136 -0.03722,0.0078 -0.05248,0.0476 -0.01526,0.03978 -0.0411,0.06408 -0.0574,0.054 -0.03277,-0.02025 -0.462299,0.323995 -0.491977,0.394291 -0.01026,0.02429 -0.07454,0.0912 -0.142856,0.148686 -0.248033,0.208705 -0.730279,0.974169 -0.672565,1.067553 0.0145,0.02346 0.0059,0.04266 -0.01914,0.04266 -0.05907,0 -0.241471,0.599428 -0.208527,0.685278 0.01385,0.0361 0.0044,0.06564 -0.02098,0.06564 -0.02539,0 -0.04169,0.0646 -0.03622,0.143558 0.0055,0.07896 -0.0042,0.213129 -0.02144,0.29816 -0.04741,0.233576 0.0511,1.055502 0.167516,1.397721 0.126048,0.370516 0.310099,0.740163 0.426484,0.856548 0.04776,0.04776 0.07554,0.08684 0.06174,0.08684 -0.0138,0 0.01516,0.05653 0.06436,0.125632 0.131301,0.184396 0.499365,0.587266 0.518785,0.567846 0.0092,-0.0092 0.09821,0.06081 0.197812,0.155562 0.09961,0.09475 0.190589,0.162786 0.202187,0.151188 0.0116,-0.0116 0.05991,0.01774 0.107361,0.06519 0.04745,0.04745 0.105426,0.07444 0.128834,0.05997 0.02341,-0.01447 0.04256,-0.0057 0.04256,0.01958 0,0.06106 0.344664,0.23496 0.399061,0.201341 0.02346,-0.0145 0.04266,-0.0059 0.04266,0.01914 0,0.05907 0.599429,0.241471 0.685279,0.208527 0.0361,-0.01385 0.06564,-0.0065 0.06564,0.01645 0,0.05196 1.079115,0.04833 1.413314,-0.0048 z"></path>
    </svg>`;

  const returnStyle = new Style({
    image: new Icon({
      src: svg,
      opacity: 1,
      anchor: [0.5, 0.92]
    }),
    text: new Text({
      text,
      font: '12px Calibri,sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 3 }),
      overflow: true
    })
  });
  if (imposedGeometry) {
    returnStyle.setGeometry(imposedGeometry);
  }
  return returnStyle;
}

/**
 * Creates an OpenLayers style function that assigns a single, randomly chosen color
 * to stroke, fill and point-image for all features styled by the returned function.
 *
 * The random RGB components are generated once when this factory function is called
 * (Math.floor(Math.random() * 255) for each of R, G and B) and therefore the same
 * color is reused for every feature styled by the returned function. The generated
 * color components are integers in the range 0..254.
 *
 * The produced style uses:
 * - Stroke: the generated RGB color at full opacity, width 2
 * - Fill: the generated RGB color at 0.4 alpha
 * - Circle image: radius 5, reusing the same stroke and fill
 * - Text (optional): if the feature exposes a '_mapTitle' property, it is used as
 *   the label text
 *
 * Notes:
 * - The returned value is a style function with the signature
 *   (feature: olFeature<OlGeometry>, resolution: number) => Style.
 *   The resolution parameter is accepted to match the expected signature but is not
 *   used when creating the style.
 * - Style objects (Stroke, Fill, Circle, etc.) are created once by the factory and
 *   reused for each invocation of the style function for performance.
 *
 * @returns A function suitable for use as an OpenLayers style function. When called
 * with an OpenLayers feature, it returns a Style that applies the precomputed random
 * color and optional label based on the feature's '_mapTitle' property.
 *
 * @example
 * // const styleFn = LayerRandomOlStyleFunction();
 * // someLayer.setStyle(styleFn);
 */
export function LayerRandomOlStyleFunction(): StyleFunction {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const stroke = new Stroke({
    color: [r, g, b, 1],
    width: 2
  });
  const fill = new Fill({
    color: [r, g, b, 0.4]
  });
  return (olFeature: OlFeature<OlGeometry>) => {
    const style = new Style({
      stroke,
      fill,
      image: new Circle({
        radius: 5,
        stroke,
        fill
      }),
      text: olFeature.get('_mapTitle')
        ? new Text({
            text: olFeature.get('_mapTitle').toString(),
            offsetX: 5,
            offsetY: -5,
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
            overflow: true
          })
        : undefined
    });
    return style;
  };
}

/**
 * Generates a Geostyler style configuration with symbolizers based on geometry types.
 *
 * @param mapTitleColumn - Optional column name to display as text labels on the map.
 *                         If provided, labels will be rendered.
 * @param geometryTypes - Array of geometry types to apply styling to.
 *                        Defaults to `['GeometryCollection']` if not provided or empty.
 *                        Supported types: 'Point', 'MultiPoint', 'Circle', 'LinearRing',
 *                        'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon',
 *                        'GeometryCollection'.
 * @returns A GsStyle object containing rules with appropriate symbolizers for the specified geometry types.
 *          - Points are styled with blue circular marks (radius 6, with stroke)
 *          - Lines are styled with blue lines (width 5)
 *          - Polygons are styled with blue fill (50% opacity) and blue strokes
 *          - GeometryCollection includes all symbolizers
 *
 * @example
 * // Style with text label
 * const style = LayerRandomGsStyle('propertyName', ['Point', 'LineString']);
 *
 * @example
 * // Style all geometry types
 * const style = LayerRandomGsStyle(undefined, ['GeometryCollection']);
 */
export function LayerRandomGsStyle(
  mapTitleColumn?: string,
  geometryTypes: Type[] = ['GeometryCollection']
): GsStyle {
  const lineSymbolizer: Symbolizer = {
    kind: 'Line',
    color: '#0000FF',
    width: 5
  };
  const fillSymbolizer: Symbolizer = {
    kind: 'Fill',
    color: '#0000ff71'
  };
  const pointSymbolizer: Symbolizer = {
    kind: 'Mark',
    wellKnownName: 'circle',
    color: '#0000ff85',
    radius: 6,
    strokeColor: '#0000FF',
    strokeWidth: 2
  };

  const gs: GsStyle = {
    name: '',
    rules: [
      {
        name: '',
        symbolizers: []
      }
    ]
  };
  if (mapTitleColumn) {
    gs.rules[0].symbolizers.push({
      kind: 'Text',
      size: 12,
      label: `{{${mapTitleColumn}}}`,
      font: ['Arial'],
      offset: [5, -5],
      haloColor: '#c9c6c6a8',
      haloWidth: 4
    });
  }

  if (!geometryTypes || geometryTypes.length === 0) {
    geometryTypes = ['GeometryCollection'];
  }
  if (
    geometryTypes.includes('Point') ||
    geometryTypes.includes('MultiPoint') ||
    geometryTypes.includes('Circle')
  ) {
    gs.rules[0].symbolizers.push(pointSymbolizer);
  }
  if (
    geometryTypes.includes('LinearRing') ||
    geometryTypes.includes('LineString') ||
    geometryTypes.includes('MultiLineString')
  ) {
    gs.rules[0].symbolizers.push(lineSymbolizer);
  }
  if (
    geometryTypes.includes('Polygon') ||
    geometryTypes.includes('MultiPolygon')
  ) {
    gs.rules[0].symbolizers.push(fillSymbolizer, lineSymbolizer);
  }
  if (geometryTypes.includes('GeometryCollection')) {
    gs.rules[0].symbolizers.push(
      pointSymbolizer,
      lineSymbolizer,
      fillSymbolizer
    );
  }
  return gs;
}

export function LayerClusterOlStyleFunction(
  feature: RenderFeature | OlFeature<OlGeometry>,
  clusterParam: ClusterParam = {}
): Style | Style[] {
  let style: StyleLike = LayerMarkerOlStyle({
    markerColor: 'rgba(24, 134, 45)'
  });
  const size = feature.get('features').length;
  if (size !== 1) {
    let clusterRadius: number;
    if (clusterParam.radiusCalc) {
      clusterRadius = clusterParam.radiusCalc(size);
    } else {
      const radiusMin = 6;
      clusterRadius = 5 * Math.log(size);
      if (clusterRadius < radiusMin) {
        clusterRadius = radiusMin;
      }
    }

    style = [
      new Style({
        image: new Circle({
          radius: clusterRadius,
          stroke: new Stroke({
            color: 'black'
          }),
          fill: new Fill({
            color: 'rgba(24, 134, 45, 0.5)'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      })
    ];
  }
  return style;
}
