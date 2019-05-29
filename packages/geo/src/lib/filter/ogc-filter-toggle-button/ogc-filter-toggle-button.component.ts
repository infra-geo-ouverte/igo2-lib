import {
  Component,
  Input,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import {
  OgcFilterableDataSource,
  IgoOgcFilterObject,
  OgcPushButton,
  OgcPushButtonBundle

} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { IgoMap } from '../../map';
import { OGCFilterService } from '../shared/ogc-filter.service';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';

@Component({
  selector: 'igo-ogc-filter-toggle-button',
  templateUrl: './ogc-filter-toggle-button.component.html',
  styleUrls: ['./ogc-filter-toggle-button.component.scss']
})
export class OgcFilterToggleButtonComponent implements OnInit {
  private ogcFilterWriter: OgcFilterWriter;
  private _dataSource: OgcFilterableDataSource;
  public color = 'primary';
  private _map: IgoMap;

  @Input() refreshFilters: () => void;

  @Input()
  get datasource(): OgcFilterableDataSource {
    return this._dataSource;
  }
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
    this.cdRef.detectChanges();
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }

  public pushButtonBundle: OgcPushButtonBundle[] = [];

  constructor(
    private ogcFilterService: OGCFilterService,
    private cdRef: ChangeDetectorRef
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
  }

  ngOnInit() {

    if (this.datasource.options.ogcFilters &&
      this.datasource.options.ogcFilters.pushButtons) {
        this.pushButtonBundle = this.datasource.options.ogcFilters.pushButtons as OgcPushButtonBundle[];
    }
    this.applyFilters();

  }

  getToolTip(pb: OgcPushButton) {
    let tt;
    if (pb.tooltip) {
      tt = pb.tooltip;
    }
    return tt;
  }

  setColor(pb: OgcPushButton) {

    let styles;
    if (pb.color) {
      styles = {
        'background-color': pb.enabled ? `rgba(${pb.color})` : `rgba(255,255,255,0)`,

      };
    }
    return styles;
  }

  bundleIsVertical(bundle: OgcPushButtonBundle): boolean {
    return bundle.vertical ? bundle.vertical : false;
  }

  applyFilters(currentOgcPushButton?: OgcPushButton) {
    if (currentOgcPushButton) {
      currentOgcPushButton.enabled = !currentOgcPushButton.enabled;
    }
    let filterQueryString = '';
    const conditions = [];
    this.pushButtonBundle.map(buttonBundle => {
      const bundleCondition = [];
      buttonBundle.ogcPushButtons
      .filter(ogcpb => ogcpb.enabled === true)
      .forEach(enabledPb => bundleCondition.push(enabledPb.filters));
      if (bundleCondition.length >= 1 ) {
        if (bundleCondition.length === 1) {
          conditions.push(bundleCondition[0]);
        } else {
          conditions.push({logical: buttonBundle.logical, filters: bundleCondition});
        }
      }
    });
    if (conditions.length >= 1) {
      filterQueryString = this.ogcFilterWriter
        .buildFilter(conditions.length === 1 ?
          conditions[0] : {logical: 'And', filters: conditions } as IgoOgcFilterObject);
    }
    this.ogcFilterService.filterByOgc(
      this.datasource as WMSDataSource,
      filterQueryString
    );
  }
}
