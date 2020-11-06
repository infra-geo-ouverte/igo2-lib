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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'igo-ogc-filter-toggle-button',
  templateUrl: './ogc-filter-toggle-button.component.html',
  styleUrls: ['./ogc-filter-toggle-button.component.scss']
})
export class OgcFilterToggleButtonComponent implements OnInit {

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  public form: FormGroup;
  private ogcFilterWriter: OgcFilterWriter;
  public color = 'primary';

  get currentPushButtonGroup() {
    return this.form.get('group').value;
  }
  set currentPushButtonGroup(value) {
    this.form.patchValue({ group: value });
  }

  constructor(
    private ogcFilterService: OGCFilterService,
    private formBuilder: FormBuilder
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      buttons: ['', [Validators.required]],
      group: ['', [Validators.required]]
    });
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

    this.form
      .get('group')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.onChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('buttons')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });
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

  private onChangeGroup() {

    this.getPushButtonsGroups().map(g => g.enabled = false);
    this.getPushButtonsGroups().find(g => g === this.currentPushButtonGroup).enabled = true;
  }

  onButtonChange(currentOgcPushButton?: OgcPushButton) {
    if (currentOgcPushButton) {
      currentOgcPushButton.enabled = !currentOgcPushButton.enabled;
    }
  }

  private applyFilters() {
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
      this.datasource.ol.refresh();
    }
  }
}
