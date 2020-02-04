import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';
import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import {
  formatWFSQueryString,
  checkWfsParams,
  defaultFieldNameGeometry
} from './wms-wfs.utils';

import { ObjectUtils } from '@igo2/utils';

export class WMSDataSource extends DataSource {
  public ol: olSourceImageWMS;

  get params(): any {
    return this.options.params as any;
  }

  get queryTitle(): string {
    return (this.options as any).queryTitle
      ? (this.options as any).queryTitle
      : 'title';
  }

  get mapLabel(): string {
    return (this.options as any).mapLabel;
  }

  get queryHtmlTarget(): string {
    return (this.options as any).queryHtmlTarget
      ? (this.options as any).queryHtmlTarget
      : QueryHtmlTarget.BLANK;
  }

  constructor(
    public options: WMSDataSourceOptions,
    protected wfsService: WFSService
  ) {
    super(options);
    const sourceParams: any = options.params;

    const dpi = sourceParams.DPI || 96;
    sourceParams.DPI = dpi;
    sourceParams.MAP_RESOLUTION = dpi;
    sourceParams.FORMAT_OPTIONS = 'dpi:' + dpi;

    if (options.refreshIntervalSec && options.refreshIntervalSec > 0) {
      setInterval(() => {
        this.refresh();
      }, options.refreshIntervalSec * 1000); // Convert seconds to MS
    }

    let fieldNameGeometry = defaultFieldNameGeometry;

    // ####   START if paramsWFS
    if (options.paramsWFS) {
      const wfsCheckup = checkWfsParams(options, 'wms');
      ObjectUtils.mergeDeep(options.paramsWFS, wfsCheckup.paramsWFS);

      fieldNameGeometry =
        options.paramsWFS.fieldNameGeometry || fieldNameGeometry;

      options.download = Object.assign({}, options.download, {
        dynamicUrl: this.buildDynamicDownloadUrlFromParamsWFS(options)
      });
    } //  ####   END  if paramsWFS

    if (!options.sourceFields || options.sourceFields.length === 0) {
      options.sourceFields = [];
    } else {
      options.sourceFields.forEach(sourceField => {
        sourceField.alias = sourceField.alias
          ? sourceField.alias
          : sourceField.name;
        // to allow only a list of sourcefield with names
      });
    }
    const initOgcFilters = (options as OgcFilterableDataSourceOptions)
      .ogcFilters;
    const ogcFilterWriter = new OgcFilterWriter();

    if (!initOgcFilters) {
      (options as OgcFilterableDataSourceOptions).ogcFilters = ogcFilterWriter.defineOgcFiltersDefaultOptions(
        initOgcFilters,
        fieldNameGeometry,
        'wms'
      );
    } else {
      initOgcFilters.advancedOgcFilters = initOgcFilters.pushButtons
        ? false
        : true;
    }

    if (
      sourceParams.LAYERS.split(',').length > 1 &&
      initOgcFilters &&
      initOgcFilters.enabled
    ) {
      console.log('*******************************');
      console.log(
        'BE CAREFULL, YOUR WMS LAYERS (' +
          sourceParams.LAYERS +
          ') MUST SHARE THE SAME FIELDS TO ALLOW ogcFilters TO WORK !! '
      );
      console.log('*******************************');
    }

    if (options.paramsWFS && initOgcFilters && initOgcFilters.enabled && initOgcFilters.editable) {
      this.wfsService.getSourceFieldsFromWFS(options);
    }

    const filterQueryString = ogcFilterWriter.handleOgcFiltersAppliedValue(
      options,
      fieldNameGeometry
    );
    sourceParams.FILTER = filterQueryString;
  }

  refresh() {
    this.ol.updateParams({ igoRefresh: Math.random() });
  }

  private buildDynamicDownloadUrlFromParamsWFS(asWFSDataSourceOptions) {
    const queryStringValues = formatWFSQueryString(asWFSDataSourceOptions);
    const downloadUrl = queryStringValues.find(f => f.name === 'getfeature')
      .value;
    return downloadUrl;
  }

  protected createOlSource(): olSourceImageWMS {
    return new olSourceImageWMS(this.options);
  }

  getLegend(style?: string, scale?: number): Legend[] {
    let legend = super.getLegend();
    if (legend.length > 0 && (style === undefined && !scale)) {
      return legend;
    }

    const sourceParams = this.params;

    let layers = [];
    if (sourceParams.LAYERS !== undefined) {
      layers = sourceParams.LAYERS.split(',');
    }

    const baseUrl = this.options.url.replace(/\?$/, '');
    const params = [
      'REQUEST=GetLegendGraphic',
      'SERVICE=WMS',
      'FORMAT=image/png',
      'SLD_VERSION=1.1.0',
      `VERSION=${sourceParams.VERSION || '1.3.0'}`
    ];
    if (style !== undefined) {
      params.push(`STYLE=${style}`);
    }
    if (scale !== undefined) {
      params.push(`SCALE=${scale}`);
    }

    legend = layers.map((layer: string) => {
      const separator = baseUrl.match(/\?/) ? '&' : '?';
      return {
        url: `${baseUrl}${separator}${params.join('&')}&LAYER=${layer}`,
        title: layers.length > 1 ? layer : undefined,
        currentStyle: style === undefined ? undefined : style as string
      };
    });

    return legend;
  }

  public onUnwatch() {}
}
