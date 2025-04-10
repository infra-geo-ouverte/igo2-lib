import { ObjectUtils } from '@igo2/utils';

import olSourceImageWMS from 'ol/source/ImageWMS';

import { BehaviorSubject } from 'rxjs';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import {
  OgcFilterDuringOptions,
  OgcFilterableDataSourceOptions,
  OgcFiltersOptions
} from '../../../filter/shared/ogc-filter.interface';
import { TimeFilterOptions } from '../../../filter/shared/time-filter.interface';
import { LegendMapViewOptions } from '../../../layer/shared/layers/legend.interface';
import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
import { WFSService } from './wfs.service';
import {
  TimeFilterableDataSourceOptions,
  WMSDataSourceOptions
} from './wms-datasource.interface';
import {
  checkWfsParams,
  defaultFieldNameGeometry,
  formatWFSQueryString
} from './wms-wfs.utils';

export interface TimeFilterableDataSource extends WMSDataSource {
  options: TimeFilterableDataSourceOptions;
  timeFilter$: BehaviorSubject<TimeFilterOptions>;
  setTimeFilter(ogcFilters: TimeFilterOptions, triggerEvent?: boolean);
  filterByDate(date: Date | [Date, Date]);
  filterByYear(year: string | [string, string]);
}

export class WMSDataSource extends DataSource {
  declare public ol: olSourceImageWMS;

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

  set ogcFilters(value: OgcFiltersOptions) {
    (this.options as OgcFilterableDataSourceOptions).ogcFilters = value;
  }
  get ogcFilters(): OgcFiltersOptions {
    return (this.options as OgcFilterableDataSourceOptions).ogcFilters;
  }

  set timeFilter(value: TimeFilterOptions) {
    (this.options as TimeFilterableDataSourceOptions).timeFilter = value;
  }
  get timeFilter(): TimeFilterOptions {
    return (this.options as TimeFilterableDataSourceOptions).timeFilter;
  }
  readonly timeFilter$ = new BehaviorSubject<TimeFilterOptions>(undefined);

  get saveableOptions(): Partial<WMSDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.params
    };
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
      options.sourceFields.forEach((sourceField) => {
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
      (options as OgcFilterableDataSourceOptions).ogcFilters =
        ogcFilterWriter.defineOgcFiltersDefaultOptions(
          initOgcFilters,
          fieldNameGeometry,
          'wms'
        );
    } else {
      initOgcFilters.advancedOgcFilters =
        initOgcFilters.pushButtons ||
        initOgcFilters.checkboxes ||
        initOgcFilters.radioButtons ||
        initOgcFilters.select ||
        initOgcFilters.autocomplete
          ? false
          : true;
      if (initOgcFilters.advancedOgcFilters && initOgcFilters.filters) {
        const filterDuring = initOgcFilters.filters as OgcFilterDuringOptions;
        if (filterDuring.calendarModeYear) {
          initOgcFilters.advancedOgcFilters = false;
        }
      }
      if (initOgcFilters.pushButtons) {
        initOgcFilters.pushButtons.selectorType = 'pushButton';
      }
      if (initOgcFilters.checkboxes) {
        initOgcFilters.checkboxes.selectorType = 'checkbox';
      }
      if (initOgcFilters.radioButtons) {
        initOgcFilters.radioButtons.selectorType = 'radioButton';
      }
      if (initOgcFilters.select) {
        initOgcFilters.select.selectorType = 'select';
      }
      if (initOgcFilters.autocomplete) {
        initOgcFilters.autocomplete.selectorType = 'autocomplete';
      }
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

    if (
      options.paramsWFS &&
      initOgcFilters &&
      initOgcFilters.enabled &&
      initOgcFilters.editable &&
      (options.sourceFields || []).filter((sf) => !sf.values).length > 0
    ) {
      this.wfsService.getSourceFieldsFromWFS(options);
    }

    const filterQueryString = ogcFilterWriter.handleOgcFiltersAppliedValue(
      options,
      fieldNameGeometry
    );
    sourceParams.FILTER = filterQueryString;
    this.ol.updateParams({ FILTER: sourceParams.FILTER });
    this.setOgcFilters(initOgcFilters, true);

    const timeFilterableDataSourceOptions =
      options as TimeFilterableDataSourceOptions;
    if (
      timeFilterableDataSourceOptions?.timeFilterable &&
      timeFilterableDataSourceOptions?.timeFilter
    ) {
      this.setTimeFilter(timeFilterableDataSourceOptions.timeFilter, true);
    }
  }

  refresh() {
    this.ol.updateParams({ igoRefresh: Math.random() });
  }

  private buildDynamicDownloadUrlFromParamsWFS(asWFSDataSourceOptions) {
    const queryStringValues = formatWFSQueryString(asWFSDataSourceOptions);
    const downloadUrl = queryStringValues.find(
      (f) => f.name === 'getfeature'
    ).value;
    return downloadUrl;
  }

  protected createOlSource(): olSourceImageWMS {
    return new olSourceImageWMS(Object.assign({ ratio: 1 }, this.options));
  }

  setOgcFilters(ogcFilters: OgcFiltersOptions, triggerEvent = false) {
    this.ogcFilters = ogcFilters;
    if (triggerEvent) {
      this.ol.notify('ogcFilters', this.ogcFilters);
    }
  }

  setTimeFilter(timeFilter: TimeFilterOptions, triggerEvent = false) {
    this.timeFilter = timeFilter;
    if (triggerEvent) {
      this.timeFilter$.next(this.timeFilter);
      this.ol.notify('timeFilter', this.ogcFilters);
    }
  }

  getLegend(style?: string, view?: LegendMapViewOptions): Legend[] {
    let legend = super.getLegend();
    if (legend.length > 0 && style === undefined && !view?.scale) {
      return legend;
    }

    let contentDependent = false;
    let projParam;

    if (
      view?.size &&
      view?.extent &&
      view?.projection &&
      this.options.contentDependentLegend
    ) {
      projParam =
        this.params.VERSION === '1.3.0' || this.params.VERSION === undefined
          ? 'CRS'
          : 'SRS';
      contentDependent = true;
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
    if (view?.scale !== undefined) {
      params.push(`SCALE=${view.scale}`);
    }
    if (contentDependent) {
      params.push(`WIDTH=${view.size[0]}`);
      params.push(`HEIGHT=${view.size[1]}`);
      params.push(`BBOX=${view.extent.join(',')}`);
      params.push(`${projParam}=${view.projection}`);
    }

    legend = layers.map((layer: string) => {
      const separator = baseUrl.match(/\?/) ? '&' : '?';
      return {
        url: `${baseUrl}${separator}${params.join('&')}&LAYER=${layer}`,
        title: layers.length > 1 ? layer : undefined,
        currentStyle: style === undefined ? undefined : (style as string)
      };
    });

    return legend;
  }

  public onUnwatch() {
    // empty
  }
}

export interface TimeFilterableDataSource extends WMSDataSource {
  options: TimeFilterableDataSourceOptions;
  timeFilter$: BehaviorSubject<TimeFilterOptions>;
  setTimeFilter(ogcFilters: TimeFilterOptions, triggerEvent?: boolean);
  filterByDate(date: Date | [Date, Date]);
  filterByYear(year: string | [string, string]);
}
