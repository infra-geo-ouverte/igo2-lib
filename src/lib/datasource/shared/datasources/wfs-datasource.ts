import { Md5 } from 'ts-md5/dist/md5';
import { uuid } from '../../../utils';
import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { IgoOgcFilterObject, OgcFilter, WFSWriteGetFeatureOptions,
  AnyBaseOgcFilterOptions, OgcFilterWriter } from '../../../filter/shared';



export class WFSDataSource extends DataSource {

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
      return new ol.source.Vector({
      format: this.getFormatFromOptions(this.options),
      overlaps: false,
      url: function(extent: ol.Extent, resolution, proj) {
              const url = this.options.url;
              const baseWfsQuery = 'service=WFS&request=GetFeature';
              const wfsVersion = this.options.version ?
              'version=' + this.options.version : 'version=' + '2.0.0';
              const featureTypes = 'typename=' + this.options.featureTypes;
              const maxFeatures = this.options.maxFeatures ?
              'maxFeatures=' + this.options.maxFeatures : 'maxFeatures=5000';
              const outputFormat = this.options.outputFormat ?
              'outputFormat=' + this.options.outputFormat : '';
              // TODO check to output in shapefile. Better
              // way to download data for user. CHECK context.json
              const outputFormatDownload = this.options.outputFormatDownload ?
              'outputFormat=' + this.options.outputFormatDownload :
              'outputFormat=' + this.options.outputFormat;
              const srsname = 'srsname=' + proj.getCode()
              const filterXML = 'filter=' + this.ogcFilterWriter.buildFilter(
                this.options.filters, extent, proj,
                this.options.version, this.options.fieldNameGeometry);
              // todo modify to prevent overriding context.json value.

              // tslint:disable-next-line:max-line-length
              this.options['download'] = {'url': `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}&${outputFormatDownload}&${srsname}&${filterXML}&${maxFeatures}`};
              // tslint:disable-next-line:max-line-length
              return `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}&${outputFormat}&${srsname}&${filterXML}&${maxFeatures}`;
          }.bind(this),
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

    let olFormatCls; //  = ol.format.GeoJSON;
    const outputFormat = options.outputFormat.toLowerCase()
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



}
