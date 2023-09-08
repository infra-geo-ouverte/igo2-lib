import olSourceVector from 'ol/source/Vector';
import olFormatEsriJSON from 'ol/format/EsriJSON';
import * as olloadingstrategy from 'ol/loadingstrategy';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
import { ArcGISRestDataSourceOptions } from './arcgisrest-datasource.interface';

export class ArcGISRestDataSource extends DataSource {
  public declare ol: olSourceVector<OlGeometry>;
  public declare options: ArcGISRestDataSourceOptions;

  protected createOlSource(): olSourceVector<OlGeometry> {
    const esrijsonFormat = new olFormatEsriJSON();
    return new olSourceVector({
      attributions: this.options.params.attributions,
      overlaps: false,
      format: esrijsonFormat,
      url: function(extent, resolution, proj) {
        const baseUrl = this.options.url + '/' + this.options.layer + '/query/';
        const geometry = encodeURIComponent(
          '{"xmin":' +
            extent[0] +
            ',"ymin":' +
            extent[1] +
            ',"xmax":' +
            extent[2] +
            ',"ymax":' +
            extent[3] +
            ',"spatialReference":{"wkid":102100}}'
        );
        const params = [
          'f=json',
          `geometry=${geometry}`,
          'geometryType=esriGeometryEnvelope',
          'inSR=102100',
          'spatialRel=esriSpatialRelIntersects',
          'outFields=*',
          'returnGeometry=true',
          'outSR=102100'
        ];
        if (this.options.params.time) {
          const time = `time=${this.options.params.time}`;
          params.push(time);
        }
        if (this.options.params.customParams) {
          this.options.params.customParams.forEach(element => {
            params.push(element);
          });
        }
        return `${baseUrl}?${params.join('&')}`;
      }.bind(this),
      strategy: olloadingstrategy.bbox
    });
  }

  getLegend(): Legend[] {
    const legendInfo = this.options.legendInfo;
    const legend = super.getLegend();
    if (legendInfo === undefined || legend.length > 0) {
      return legend;
    }
    if (!legendInfo) {
      return;
    }
    let htmlString = '<table>';
    let src: string;
    let label: string;
    let svg: string;

    if (legendInfo.legend) {
      for (const legendElement of legendInfo.legend) {
        src = this.htmlImgSrc(legendElement.contentType, legendElement.imageData);
        label = legendElement.label ? legendElement.label.replace('<Null>', 'Null') : '';
        htmlString +=
          `<tr><td align='left'><img src="` +
          src +
          `" alt ='' /></td><td class="mat-typography">` +
          label +
          '</td></tr>';
      }
    } else if (legendInfo.type === "uniqueValue") {
      for (const legendElement of legendInfo.uniqueValueInfos) {
        label = legendElement.label.replace('<Null>', 'Null');
        if (legendElement.symbol.type === 'esriPMS') {
          src = this.htmlImgSrc(legendElement.symbol.contentType, legendElement.symbol.imageData);
          htmlString +=
            `<tr><td align='left'><img src="` +
            src +
            `" alt ='' /></td><td class="mat-typography">` +
            label +
            '</td></tr>';
        } else if (legendElement.symbol.type !== 'esriPMS') {
          svg = this.createSVG(legendElement.symbol);
          htmlString += `<tr><td align='left'>` + svg + `</td><td class="mat-typography">` + label + '</td></tr>';
        }
      }
    } else if (legendInfo.type === "simple") {
      label = legendInfo.label ? legendInfo.label.replace('<Null>', 'Null') : '';
      if (legendInfo.symbol.type === 'esriPMS') {
        src = this.htmlImgSrc(legendInfo.symbol.contentType, legendInfo.symbol.imageData);
        htmlString +=
          `<tr><td align='left'><img src="` +
          src +
          `" alt ='' /></td><td class="mat-typography">` +
          label +
          '</td></tr>';
      } else if (legendInfo.symbol.type !== 'esriPMS') {
        svg = this.createSVG(legendInfo.symbol);
        htmlString += `<tr><td align='left'>` + svg + `</td><td class="mat-typography">` + label + '</td></tr>';
      }
    }
    htmlString += '</table>';
    return [{ html: htmlString }];
  }

  htmlImgSrc(contentType: string, imageData: string): string {
    return `data:${contentType};base64,${imageData}`;
  }

  createSVG(symbol): string {
    let svg: string = '';

    const color: Array<number> = symbol.color ? symbol.color : [0, 0, 0, 0];

    if (symbol.type === 'esriSLS') {
      const width: number = symbol.width ? symbol.width : 0;

      const stroke: string = `stroke:rgba(` + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
      const strokeWidth: string = `stroke-width:` + width;

      if (symbol.style === 'esriSLSSolid') {
        svg = `<svg height="30" width="30"><line x1="0" y1="15" x2="30" y2="15" style="` + stroke + ';' + strokeWidth + `"/></svg>`;
      } else if (symbol.style === 'esriSLSDash') {
        const strokeDashArray: string = `stroke-dasharray="5,5"`;
        svg = `<svg height="30" width="30"><line x1="0" y1="15" x2="30" y2="15" style="` + stroke + ';' + strokeWidth + `" `+ strokeDashArray + `/></svg>`;
      }
    } else if (symbol.style === 'esriSMSCircle' || symbol.style === 'esriSFSSolid') {
      const outlineColor = symbol.outline.color;
      const outlineWidth = symbol.outline.width;
      const size = symbol.size;

      const stroke = `stroke:rgba(` + outlineColor[0] + ',' + outlineColor[1] + ',' + outlineColor[2] + ',' + outlineColor[3] + ')';
      const strokeWidth = `stroke-width:` + outlineWidth;
      const fill = `fill:rgba(` + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';

      if (symbol.style === 'esriSMSCircle') {
        svg = `<svg height="30" width="30"><circle cx="15" cy="15" r="` + size/2 + `" style="` + stroke + ';' + strokeWidth + ';' + fill + `"/></svg>`;
      } else {
        svg = `<svg height="30" width="30"><rect x="5" y="5" width="20" height="20" style ="` + stroke + ';' + strokeWidth + ';' + fill + `"/></svg>`;
      }
    }
    return svg;
  }

  public onUnwatch() {}
}
