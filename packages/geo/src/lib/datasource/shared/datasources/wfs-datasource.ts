import { AuthInterceptor } from '@igo2/auth';

import * as OlLoadingStrategy from 'ol/loadingstrategy';
import olSourceVector from 'ol/source/Vector';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import {
  OgcFilterableDataSourceOptions,
  OgcFiltersOptions
} from '../../../filter/shared/ogc-filter.interface';
import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';
import {
  checkWfsParams,
  defaultFieldNameGeometry,
  getFormatFromOptions
} from './wms-wfs.utils';

export class WFSDataSource extends DataSource {
  public declare ol: olSourceVector;

  set ogcFilters(value: OgcFiltersOptions) {
    (this.options as OgcFilterableDataSourceOptions).ogcFilters = value;
  }
  get ogcFilters(): OgcFiltersOptions {
    return (this.options as OgcFilterableDataSourceOptions).ogcFilters;
  }

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService,
    private authInterceptor?: AuthInterceptor
  ) {
    super(checkWfsParams(options, 'wfs'));

    const ogcFilters = (this.options as OgcFilterableDataSourceOptions)
      .ogcFilters;
    const fieldNameGeometry =
      this.options.paramsWFS.fieldNameGeometry || defaultFieldNameGeometry;
    const ogcFilterWriter = new OgcFilterWriter();
    (this.options as OgcFilterableDataSourceOptions).ogcFilters =
      ogcFilterWriter.defineOgcFiltersDefaultOptions(
        ogcFilters,
        fieldNameGeometry
      );
    if (
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled &&
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.editable &&
      (options.sourceFields || []).filter((sf) => !sf.values).length > 0
    ) {
      this.wfsService.getSourceFieldsFromWFS(this.options);
    }

    if (ogcFilters?.pushButtons) {
      ogcFilters.pushButtons.selectorType = 'pushButton';
    }
    if (ogcFilters?.checkboxes) {
      ogcFilters.checkboxes.selectorType = 'checkbox';
    }
    if (ogcFilters?.radioButtons) {
      ogcFilters.radioButtons.selectorType = 'radioButton';
    }
    if (ogcFilters?.select) {
      ogcFilters.select.selectorType = 'select';
    }
    if (ogcFilters?.autocomplete) {
      ogcFilters.autocomplete.selectorType = 'autocomplete';
    }

    this.setOgcFilters(
      (this.options as OgcFilterableDataSourceOptions).ogcFilters,
      true
    );
  }

  protected createOlSource(): olSourceVector {
    const vectorSource = new olSourceVector({
      format: getFormatFromOptions(this.options),
      strategy: OlLoadingStrategy.bbox
    });
    return vectorSource;
  }

  setOgcFilters(ogcFilters: OgcFiltersOptions, triggerEvent: boolean = false) {
    this.ogcFilters = ogcFilters;
    if (triggerEvent) {
      this.ol.notify('ogcFilters', this.ogcFilters);
    }
  }

  public onUnwatch() {}
}
