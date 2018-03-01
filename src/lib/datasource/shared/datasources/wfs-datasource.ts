import { Md5 } from 'ts-md5/dist/md5';


import { uuid } from '../../../utils';
import { IgoOgcFilterObject, OgcFilter, WFSWriteGetFeatureOptions,
  AnyBaseOgcFilterOptions, OgcFilterWriter } from '../../../filter/shared';
import { DataSource } from './datasource';
import { OgcFilterableDataSource } from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { IgoOgcFilterObject, OgcFilter, WFSWriteGetFeatureOptions,
  AnyBaseOgcFilterOptions, OgcFilterWriter } from '../../../filter/shared';


export class WFSDataSource extends DataSource implements OgcFilterableDataSource {

  public options: WFSDataSourceOptions;
  public ol: ol.source.Vector;
  public igoFilterArray: IgoOgcFilterObject;
  public ogcFilter: OgcFilter;
  public wfsWriteGetFeatureOptions: WFSWriteGetFeatureOptions;
  public anyBaseOgcFilterOptions: AnyBaseOgcFilterOptions;
  public ogcFilterWriter: OgcFilterWriter;


  constructor(options: WFSDataSourceOptions) {
    super(options);
    this.ogcFilterWriter = new OgcFilterWriter;
    this.checkOutputFormat(options);
  }


  protected generateId() {
    if (!this.options.url) {
      return uuid();
    }
    const chain = 'feature' + this.options.url;
    return Md5.hashStr(chain) as string;
  }


  protected createOlSource(): ol.source.Vector {
    const wfsOptions: WFSDataSourceOptions = this.options;
    const mandatoryParamMissing: any[] = [];

    ['url', 'featureTypes', 'fieldNameGeometry'].forEach(element => {
      if (wfsOptions[element] === undefined) {
        mandatoryParamMissing.push(element);
      }
    });
    if (mandatoryParamMissing.length > 0) {
      throw new Error(`A mandatory parameter is missing
      for your WFS datasource source.
      (Mandatory parameter(s) missing :` + mandatoryParamMissing);
    }

    return new ol.source.Vector({
      format: this.getFormatFromOptions(wfsOptions),
      overlaps: false,
      url: (extent: ol.Extent, resolution, proj) => {
        const baseWfsQuery = 'service=WFS&request=GetFeature';
        // Mandatory
        const url = wfsOptions.url;
        const featureTypes = 'typename=' + wfsOptions.featureTypes;

        // Optional
        const outputFormat = wfsOptions.outputFormat ?
          'outputFormat=' + wfsOptions.outputFormat : '';
        const wfsVersion = wfsOptions.version ?
          'version=' + wfsOptions.version : 'version=' + '2.0.0';
        const maxFeatures = wfsOptions.maxFeatures ?
          'maxFeatures=' + wfsOptions.maxFeatures : 'maxFeatures=5000';
        const srsname = wfsOptions.srsname ?
          'srsname=' + wfsOptions.srsname : 'srsname=' + proj.getCode();

        const filterXML = this.ogcFilterWriter.buildFilter(
          this.options.filters, extent, proj, this.options.fieldNameGeometry
        );

        let urlDownload = `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}`;
        urlDownload += `&${outputFormat}&${srsname}&${filterXML}&${maxFeatures}`;
        this.options.download = {'url': urlDownload};
        return urlDownload;
      },
      strategy: ol.loadingstrategy.bbox
    });
  }

  private checkOutputFormat(opt: WFSDataSourceOptions): WFSDataSourceOptions {
    // Look at https://github.com/openlayers/openlayers/pull/6400
    const patternGml = new RegExp('.*?gml.*?');

    if (patternGml.test(opt.outputFormat)) {
      opt.version = '1.1.0';
    }
    return opt;

  }

  public getFormatFromOptions(options: WFSDataSourceOptions) {

    let olFormatCls;
    const outputFormat = options.outputFormat.toLowerCase();
    const patternGml3 = new RegExp('.*?gml.*?');
    const patternGeojson = new RegExp('.*?json.*?');

    if (patternGeojson.test(outputFormat)) {

      olFormatCls = ol.format.GeoJSON;
    }

    if (patternGml3.test(outputFormat)) {
      olFormatCls = ol.format.WFS;
    }

    return new olFormatCls();
  }

  public filterByOgc(igoOgcFilterObject: IgoOgcFilterObject) {}

}
