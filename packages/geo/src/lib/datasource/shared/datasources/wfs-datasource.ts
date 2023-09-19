import olSourceVector from 'ol/source/Vector';
import * as OlLoadingStrategy from 'ol/loadingstrategy';
import olProjection from 'ol/proj/Projection';
import * as olproj from 'ol/proj';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import {
  OgcFilterableDataSourceOptions,
  OgcFiltersOptions
} from '../../../filter/shared/ogc-filter.interface';
import {
  defaultFieldNameGeometry,
  checkWfsParams,
  getFormatFromOptions,
  buildUrl
} from './wms-wfs.utils';
import { AuthInterceptor } from '@igo2/auth';

export class WFSDataSource extends DataSource {
  public declare ol: olSourceVector<OlGeometry>;
  public mostRecentIdCallOGCFilter: number = 0;

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

  protected createOlSource(): olSourceVector<OlGeometry> {
    const vectorSource = new olSourceVector({
      format: getFormatFromOptions(this.options),
      url: (extent, resolution, proj: olProjection) => {
        const paramsWFS = this.options.paramsWFS;
        const wfsProj = paramsWFS.srsName
          ? new olProjection({ code: paramsWFS.srsName })
          : proj;
        const ogcFilters = (this.options as OgcFilterableDataSourceOptions)
          .ogcFilters;
        const currentExtent = olproj.transformExtent(extent, proj, wfsProj);
        paramsWFS.srsName = paramsWFS.srsName || proj.getCode();
        return buildUrl(this.options, currentExtent, wfsProj, ogcFilters);
      },
      strategy: OlLoadingStrategy.bbox
    });
    return vectorSource;
  }

  setOgcFilters(ogcFilters: OgcFiltersOptions, triggerEvent: boolean = false) {
    this.ogcFilters = ogcFilters;
    this.mostRecentIdCallOGCFilter += 1;
    if (triggerEvent) {
      this.ol.notify('ogcFilters', this.ogcFilters);
    }
  }

  public onUnwatch() {}
}
