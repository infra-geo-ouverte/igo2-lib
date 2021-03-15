import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import {
  OgcFilterableDataSource,
  IgoOgcFilterObject,
  OgcPushButton,
  OgcSelectorBundle,
  SelectorGroup

} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { IgoMap } from '../../map';
import { OGCFilterService } from '../shared/ogc-filter.service';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'igo-ogc-filter-selection',
  templateUrl: './ogc-filter-selection.component.html',
  styleUrls: ['./ogc-filter-selection.component.scss']
})
export class OgcFilterSelectionComponent implements OnInit {

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  public form: FormGroup;
  private ogcFilterWriter: OgcFilterWriter;
  public color = 'primary';

  get currentGroup() {
    return this.form.get('group').value;
  }
  set currentGroup(value) {
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
      pushButtons: ['', [Validators.required]],
      checkboxes: ['', [Validators.required]],
      radioButtons: ['', [Validators.required]],
      group: ['', [Validators.required]]
    });
  }

  getSelectorGroups(): SelectorGroup[] {
    if (this.datasource.options.ogcFilters.pushButtons) {
      return this.datasource.options.ogcFilters.pushButtons.groups;
    } else if (this.datasource.options.ogcFilters.checkboxes) {
      return this.datasource.options.ogcFilters.checkboxes.groups;
    } else if (this.datasource.options.ogcFilters.radioButtons) {
      return this.datasource.options.ogcFilters.radioButtons.groups;
    }
  }

  ngOnInit() {
    if (this.datasource.options.ogcFilters) {
      if (this.datasource.options.ogcFilters.pushButtons) {
        this.currentGroup =
          this.datasource.options.ogcFilters.pushButtons.groups.find(g => g.enabled) ||
          this.datasource.options.ogcFilters.pushButtons.groups[0];
      }
      if (this.datasource.options.ogcFilters.checkboxes) {
        this.currentGroup =
          this.datasource.options.ogcFilters.checkboxes.groups.find(g => g.enabled) ||
          this.datasource.options.ogcFilters.checkboxes.groups[0];
      }
      if (this.datasource.options.ogcFilters.radioButtons) {
        this.currentGroup =
          this.datasource.options.ogcFilters.radioButtons.groups.find(g => g.enabled) ||
          this.datasource.options.ogcFilters.radioButtons.groups[0];
      }
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
      .get('pushButtons')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });
    this.form
      .get('checkboxes')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });
    this.form
      .get('radioButtons')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  getToolTip(selector): string  {
    let tt;
    if (selector.tooltip) {
      if (Array.isArray(selector.tooltip)) {
        tt = selector.tooltip.join('\n');
      } else {
        tt = selector.tooltip;
      }
    }
    return tt || '';
  }

  // getButtonStyle(pb: OgcPushButton): {} {

  //   let styles;
  //   if (pb.color) {
  //     styles = {
  //       'background-color': pb.enabled ? `rgba(${pb.color})` : `rgba(255,255,255,0)`
  //     };
  //   } else {
  //     styles = {
  //       'background-color': pb.enabled ? 'accent': `rgba(255,255,255,0)`,
  //       'color': pb.enabled ? `rgba(0,0,0,0.9)` : `rgba(33,33,33,0.38)`
  //     }
  //   }
  //   return styles;
  // }

  getButtonColor(pb: OgcPushButton): {} {
    let styles;
    if (pb.color && pb.enabled) {
      styles = {
        'background-color': `rgba(${pb.color})`
      };
    }
    return styles;
  }

  bundleIsVertical(bundle: OgcSelectorBundle): boolean {
    return bundle.vertical ? bundle.vertical : false;
  }

  private onChangeGroup() {
    this.getSelectorGroups().map(g => g.enabled = false);
    this.getSelectorGroups().find(g => g === this.currentGroup).enabled = true;
  }

  onSelectionChange(currentOgcSelection?) {
    console.log(currentOgcSelection);
    if (currentOgcSelection) {
      currentOgcSelection.enabled = !currentOgcSelection.enabled;
    }
  }

  private applyFilters() {
    let filterQueryString = '';
    const conditions = [];
    this.currentGroup.computedSelectors.map(selectorBundle => {
      const bundleCondition = [];
      selectorBundle.selectors
      .filter(ogcSelector => ogcSelector.enabled === true)
      .forEach(enabledSelector => bundleCondition.push(enabledSelector.filters));
      if (bundleCondition.length >= 1 ) {
        if (bundleCondition.length === 1) {
          conditions.push(bundleCondition[0]);
        } else {
          conditions.push({logical: selectorBundle.logical, filters: bundleCondition});
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
    this.refreshFilters();
  }
}
