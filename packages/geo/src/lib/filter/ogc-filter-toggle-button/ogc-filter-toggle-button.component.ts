import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import {
  OgcFilterableDataSource,
  IgoOgcFilterObject,
  OgcPushButton,
  OgcPushButtonBundle,
  PushButtonGroup

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

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  private ogcFilterWriter: OgcFilterWriter;
  public color = 'primary';
  public currentPushButtonGroup;

  constructor(
    private ogcFilterService: OGCFilterService
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
  }

  getPushButtonsGroups(): PushButtonGroup[] {
    return this.datasource.options.ogcFilters.pushButtons.groups;
  }

  ngOnInit() {
    if (this.datasource.options.ogcFilters &&
      this.datasource.options.ogcFilters.pushButtons) {
      this.currentPushButtonGroup =
        this.datasource.options.ogcFilters.pushButtons.groups.find(g => g.enabled) ||
        this.datasource.options.ogcFilters.pushButtons.groups[0];
    }
    this.applyFilters();
  }

  getToolTip(pb: OgcPushButton): string  {
    let tt;
    if (pb.tooltip) {
      if (Array.isArray(pb.tooltip)) {
        tt = pb.tooltip.join('\n');
      } else {
        tt = pb.tooltip;
      }
    }
    return tt || '';
  }

  getButtonColor(pb: OgcPushButton): {} {

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

  onChangeGroup() {

    this.getPushButtonsGroups().map(g => g.enabled = false);
    this.getPushButtonsGroups().find(g => g === this.currentPushButtonGroup).enabled = true;
    this.applyFilters();
  }

  applyFilters(currentOgcPushButton?: OgcPushButton) {
    if (currentOgcPushButton) {
      currentOgcPushButton.enabled = !currentOgcPushButton.enabled;
    }
    let filterQueryString = '';
    const conditions = [];
    this.currentPushButtonGroup.computedButtons.map(buttonBundle => {
      const bundleCondition = [];
      buttonBundle.buttons
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
    if (this.datasource.options.type === 'wms') {
      this.ogcFilterService.filterByOgc(this.datasource as WMSDataSource, filterQueryString );
    }
    if (this.datasource.options.type === 'wfs') {
      // TODO: Check how to prevent wfs to refresh when filter icon is pushed...
      this.datasource.ol.clear();
    }
  }
}
