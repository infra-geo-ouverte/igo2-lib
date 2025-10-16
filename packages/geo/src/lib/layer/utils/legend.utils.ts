import { ArcGISRestDataSource } from '../../datasource/shared/datasources/arcgisrest-datasource';
import { ArcGISRestDataSourceOptions } from '../../datasource/shared/datasources/arcgisrest-datasource.interface';
import { CartoDataSource } from '../../datasource/shared/datasources/carto-datasource';
import { CartoDataSourceOptions } from '../../datasource/shared/datasources/carto-datasource.interface';
import { ImageArcGISRestDataSource } from '../../datasource/shared/datasources/imagearcgisrest-datasource';
import { ArcGISRestImageDataSourceOptions } from '../../datasource/shared/datasources/imagearcgisrest-datasource.interface';
import { TileArcGISRestDataSource } from '../../datasource/shared/datasources/tilearcgisrest-datasource';
import { TileArcGISRestDataSourceOptions } from '../../datasource/shared/datasources/tilearcgisrest-datasource.interface';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { AnyLayer } from '../shared';
import {
  Legend,
  LegendMapViewOptions
} from '../shared/layers/legend.interface';
import { isLayerGroup } from './layer.utils';

/**
 * Get all the layers legend
 * @return Array of legend
 */
export function getLayersLegends(layers: AnyLayer[]): Legend[][] {
  return layers.map((layer) => getLayerLegend(layer));
}

export function getLayerLegend(
  layer: AnyLayer,
  legendMapViewOptions?: LegendMapViewOptions
): Legend[] {
  if (isLayerGroup(layer)) {
    return [];
  }
  let legends: Legend[] = [];
  switch (layer.dataSource.constructor) {
    case CartoDataSource:
      legends = getLegendsForCartoDataSourceOptions(
        layer.dataSource.options as CartoDataSourceOptions
      );
      break;
    case TileArcGISRestDataSource:
      legends = getLegendsForImageOrTileArcGISRestDataSourceOptions(
        layer.dataSource.options as TileArcGISRestDataSourceOptions
      );
      break;
    case ImageArcGISRestDataSource:
      legends = getLegendsForImageOrTileArcGISRestDataSourceOptions(
        layer.dataSource.options as ArcGISRestImageDataSourceOptions
      );
      break;
    case ArcGISRestDataSource:
      legends = getLegendsForArcGISRestDataSourceOptions(
        layer.dataSource.options as ArcGISRestDataSourceOptions
      );
      break;
    case WMSDataSource:
      legends = getLegendsForWmsDataSourceOptions(
        layer.dataSource.options as WMSDataSourceOptions,
        legendMapViewOptions,
        layer.options?.legendsSpecifications?.updateOnViewChange
      );
      break;
    default:
      break;
  }

  return legends;
}

function getLegendsForCartoDataSourceOptions(
  dataSourceOptions: CartoDataSourceOptions
): Legend[] {
  let htmlString = '';
  if (dataSourceOptions.config.layers[0].legend) {
    dataSourceOptions.config.layers[0].legend.items.forEach((item) => {
      if (item.visible === true) {
        htmlString += `<tr><td><p><font size="5" color="${item.value}"> &#9679</font></p></td><td>${item.name}</td></tr>`;
      }
    });
    return [{ htmls: [`<table>${htmlString}</table>`] }];
  } else {
    const layerOptions = dataSourceOptions.config.layers[0].options;
    const types = [
      'polygon-fill:',
      'marker-fill:',
      'shield-fill:',
      'building-fill:',
      'line-color:'
    ];
    for (const oneType of types) {
      if (layerOptions.cartocss.includes(oneType)) {
        const type = layerOptions.cartocss.split(oneType).pop();
        const color = type.substr(0, type.indexOf(';'));
        if (color.includes('ramp')) {
          const colors = color.split(', (')[1].split(',');
          const data = color.split(', (')[2].split(',');
          for (let j = 0; j < colors.length; j++) {
            colors[j] = colors[j].replace(/("|\))/g, '');
            data[j] = data[j].replace(/("|\))/g, '');
            if (data[j].replace(/\s+/g, '') === '=') {
              data[j] = 'Autres';
            }
            htmlString += `<tr><td><p><font size="5" color="${colors[j]}"> &#9679</font></p></td><td>${data[j]}</td></tr>`;
          }
          break;
        } else {
          const title = layerOptions.layer_name ? layerOptions.layer_name : '';
          htmlString += `<tr><td><p><font size="5" color="${color}"> &#9679</font></p></td><td>${title}</td></tr>`;
          break;
        }
      }
    }
    return [{ htmls: [`<table>${htmlString}</table>`] }];
  }
}
function getLegendsForImageOrTileArcGISRestDataSourceOptions(
  dataSourceOptions:
    | TileArcGISRestDataSourceOptions
    | ArcGISRestImageDataSourceOptions
): Legend[] {
  const legendInfo = dataSourceOptions.legendInfo;

  if (!legendInfo) {
    return;
  }
  let htmlString = '';

  for (const legendElement of legendInfo.legend) {
    const src = `${dataSourceOptions.url}/${legendInfo.layerId}/images/${legendElement.url}`;
    const label = legendElement.label.replace('<Null>', 'Null');
    htmlString += `<tr><td align='left'><img src="${src}" alt ='' /></td><td>${label}</td></tr>`;
  }
  return [{ htmls: [`<table>${htmlString}</table>`] }];
}
function getLegendsForArcGISRestDataSourceOptions(
  dataSourceOptions: ArcGISRestDataSourceOptions
): Legend[] {
  const legendInfo = dataSourceOptions.legendInfo;
  if (!legendInfo) {
    return;
  }
  let htmlString = '<table>';
  let src: string;
  let label: string;
  let svg: string;

  if (legendInfo.legend) {
    for (const legendElement of legendInfo.legend) {
      src = htmlImgSrc(legendElement.contentType, legendElement.imageData);
      label = legendElement.label
        ? legendElement.label.replace('<Null>', 'Null')
        : '';
      htmlString +=
        `<tr><td align='left'><img src="` +
        src +
        `" alt ='' /></td><td>` +
        label +
        '</td></tr>';
    }
  } else if (legendInfo.type === 'uniqueValue') {
    for (const legendElement of legendInfo.uniqueValueInfos) {
      label = legendElement.label.replace('<Null>', 'Null');
      if (legendElement.symbol.type === 'esriPMS') {
        src = htmlImgSrc(
          legendElement.symbol.contentType,
          legendElement.symbol.imageData
        );
        htmlString +=
          `<tr><td align='left'><img src="` +
          src +
          `" alt ='' /></td><td>` +
          label +
          '</td></tr>';
      } else if (legendElement.symbol.type !== 'esriPMS') {
        svg = createSVG(legendElement.symbol);
        htmlString +=
          `<tr><td align='left'>` + svg + `</td><td>` + label + '</td></tr>';
      }
    }
  } else if (legendInfo.type === 'simple') {
    label = legendInfo.label ? legendInfo.label.replace('<Null>', 'Null') : '';
    if (legendInfo.symbol.type === 'esriPMS') {
      src = htmlImgSrc(
        legendInfo.symbol.contentType,
        legendInfo.symbol.imageData
      );
      htmlString +=
        `<tr><td align='left'><img src="` +
        src +
        `" alt ='' /></td><td>` +
        label +
        '</td></tr>';
    } else if (legendInfo.symbol.type !== 'esriPMS') {
      svg = createSVG(legendInfo.symbol);
      htmlString +=
        `<tr><td align='left'>` + svg + `</td><td>` + label + '</td></tr>';
    }
  }
  htmlString += '</table>';
  return [{ htmls: [htmlString] }];
}

//   getLegend(style?: string, view?: LegendMapViewOptions): Legend[] {
function getLegendsForWmsDataSourceOptions(
  dataSourceOptions: WMSDataSourceOptions,
  view?: LegendMapViewOptions,
  updateOnViewChange: boolean = false
): Legend[] {
  let projParam = 'CRS';
  const sourceParams = dataSourceOptions.params;
  if (view && updateOnViewChange) {
    projParam = sourceParams?.VERSION === '1.3.0' ? 'CRS' : 'SRS';
  }

  let layers = [];
  if (sourceParams.LAYERS !== undefined) {
    layers = sourceParams.LAYERS.split(',');
  }

  const baseUrl = dataSourceOptions.url.replace(/\?$/, '');
  const params = [
    'REQUEST=GetLegendGraphic',
    'SERVICE=WMS',
    'FORMAT=image/png',
    'SLD_VERSION=1.1.0',
    `VERSION=${sourceParams.VERSION || '1.3.0'}`
  ];
  if (sourceParams.STYLES) {
    params.push(`STYLE=${sourceParams.STYLES}`);
  }
  if (view?.scale !== undefined) {
    params.push(`SCALE=${view.scale}`);
  }
  if (updateOnViewChange) {
    params.push(`WIDTH=${view.size[0]}`);
    params.push(`HEIGHT=${view.size[1]}`);
    params.push(`BBOX=${view.extent.join(',')}`);
    params.push(`${projParam}=${view.projection}`);
  }

  const urls = layers.map((layer: string) => {
    const separator = baseUrl.match(/\?/) ? '&' : '?';
    return `${baseUrl}${separator}${params.join('&')}&LAYER=${layer}`;
  });
  return [
    {
      urls: urls,
      title: undefined
    } satisfies Legend
  ];
}

function htmlImgSrc(contentType: string, imageData: string): string {
  return `data:${contentType};base64,${imageData}`;
}

function createSVG(symbol): string {
  let svg = '';

  const color: number[] = symbol.color ? symbol.color : [0, 0, 0, 0];

  if (symbol.type === 'esriSLS') {
    const width: number = symbol.width ? symbol.width : 0;

    const stroke: string =
      `stroke:rgba(` +
      color[0] +
      ',' +
      color[1] +
      ',' +
      color[2] +
      ',' +
      color[3] +
      ')';
    const strokeWidth: string = `stroke-width:` + width;

    if (symbol.style === 'esriSLSSolid') {
      svg =
        `<svg height="30" width="30"><line x1="0" y1="15" x2="30" y2="15" style="` +
        stroke +
        ';' +
        strokeWidth +
        `"/></svg>`;
    } else if (symbol.style === 'esriSLSDash') {
      const strokeDashArray = `stroke-dasharray="5,5"`;
      svg =
        `<svg height="30" width="30"><line x1="0" y1="15" x2="30" y2="15" style="` +
        stroke +
        ';' +
        strokeWidth +
        `" ` +
        strokeDashArray +
        `/></svg>`;
    }
  } else if (
    symbol.style === 'esriSMSCircle' ||
    symbol.style === 'esriSFSSolid'
  ) {
    const outlineColor = symbol.outline.color;
    const outlineWidth = symbol.outline.width;
    const size = symbol.size;

    const stroke =
      `stroke:rgba(` +
      outlineColor[0] +
      ',' +
      outlineColor[1] +
      ',' +
      outlineColor[2] +
      ',' +
      outlineColor[3] +
      ')';
    const strokeWidth = `stroke-width:` + outlineWidth;
    const fill =
      `fill:rgba(` +
      color[0] +
      ',' +
      color[1] +
      ',' +
      color[2] +
      ',' +
      color[3] +
      ')';

    if (symbol.style === 'esriSMSCircle') {
      svg =
        `<svg height="30" width="30"><circle cx="15" cy="15" r="` +
        size / 2 +
        `" style="` +
        stroke +
        ';' +
        strokeWidth +
        ';' +
        fill +
        `"/></svg>`;
    } else {
      svg =
        `<svg height="30" width="30"><rect x="5" y="5" width="20" height="20" style ="` +
        stroke +
        ';' +
        strokeWidth +
        ';' +
        fill +
        `"/></svg>`;
    }
  }
  return svg;
}
