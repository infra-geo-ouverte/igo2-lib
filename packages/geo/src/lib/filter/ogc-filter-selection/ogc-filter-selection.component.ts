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

  @Input() checkboxesIndex = 5;
  @Input() radioButtonsIndex = 5;
  @Input() baseIndex = 5;

  public form: FormGroup;
  private ogcFilterWriter: OgcFilterWriter;
  public color = 'primary';

  get ogcFiltersSelectors() {
    let ogcSelector = [];
    if (this.datasource?.options?.ogcFilters?.pushButtons) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.pushButtons);
    }
    if (this.datasource?.options?.ogcFilters?.checkboxes) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.checkboxes);
    }
    if (this.datasource?.options?.ogcFilters?.radioButtons) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.radioButtons);
    }
    ogcSelector.sort((a, b) => {
      if (a.order < b.order) {
        return -1;
      }
      if (a.order > b.order) {
        return 1;
      }
      return 0;
    })
    return ogcSelector;
  }

  get currentPushButtonsGroup() {
    return this.form.get('pushButtonsGroup').value;
  }
  set currentPushButtonsGroup(value) {
    this.form.patchValue({ pushButtonsGroup: value });
  }

  get currentCheckboxesGroup() {
    return this.form.get('checkboxesGroup').value;
  }
  set currentCheckboxesGroup(value) {
    this.form.patchValue({ checkboxesGroup: value });
  }

  get currentRadioButtonsGroup() {
    return this.form.get('radioButtonsGroup').value;
  }
  set currentRadioButtonsGroup(value) {
    this.form.patchValue({ radioButtonsGroup: value });
  }

  getCurrentCheckboxesSelectors(bundle) {
    const current = [];
    if (bundle?.selectors.length) {
      for (let i = 0; i < this.checkboxesIndex; i++) {
        if (bundle.selectors[i]) {
          current.push(bundle.selectors[i]);
        }
      }
    }
    return current;
  }

  getCurrentRadioButtonsSelectors(bundle) {
    const current = [];
    if (bundle?.selectors.length) {
      for (let i = 0; i < this.radioButtonsIndex; i++) {
        if (bundle.selectors[i]) {
          current.push(bundle.selectors[i]);
        }
      }
    }
    return current;
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
      pushButtonsGroup: ['', [Validators.required]],
      checkboxesGroup: ['', [Validators.required]],
      radioButtonsGroup: ['', [Validators.required]]
    });
  }

  getPushButtonsGroups(): SelectorGroup[] {
    if (this.datasource?.options?.ogcFilters?.pushButtons) {
      return this.datasource.options.ogcFilters.pushButtons.groups;
    }
  }

  getCheckboxesGroups(): SelectorGroup[] {
    if (this.datasource?.options?.ogcFilters?.checkboxes) {
      return this.datasource.options.ogcFilters.checkboxes.groups;
    }
  }

  getRadioButtonsGroups(): SelectorGroup[] {
    if (this.datasource?.options?.ogcFilters?.radioButtons) {
      return this.datasource.options.ogcFilters.radioButtons.groups;
    }
  }

  ngOnInit() {
    if (this.datasource.options.ogcFilters) {
      if (this.datasource.options.ogcFilters.pushButtons) {
        this.currentPushButtonsGroup =
          this.datasource.options.ogcFilters.pushButtons.groups.find(g => g.enabled) ||
          this.datasource.options.ogcFilters.pushButtons.groups[0];
        this.applyFilters();
      }
      if (this.datasource.options.ogcFilters.checkboxes) {
        this.currentCheckboxesGroup =
          this.datasource.options.ogcFilters.checkboxes.groups.find(g => g.enabled) ||
          this.datasource.options.ogcFilters.checkboxes.groups[0];
        this.applyFilters();
      }
      if (this.datasource.options.ogcFilters.radioButtons) {
        this.currentRadioButtonsGroup =
          this.datasource.options.ogcFilters.radioButtons.groups.find(g => g.enabled) ||
          this.datasource.options.ogcFilters.radioButtons.groups[0];
        this.applyFilters();
      }
    }

    this.form
    .get('pushButtonsGroup')
    .valueChanges
    .pipe(debounceTime(750))
    .subscribe(() => {
      this.onPushButtonsChangeGroup();
      this.applyFilters();
      });
    this.form
    .get('checkboxesGroup')
    .valueChanges
    .pipe(debounceTime(750))
    .subscribe(() => {
      this.onCheckboxesChangeGroup();
      this.applyFilters();
      });
    this.form
      .get('radioButtonsGroup')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.onRadioButtonsChangeGroup();
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

      console.log(this.ogcFiltersSelectors);
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

  private onPushButtonsChangeGroup() {
    this.getPushButtonsGroups().map(g => g.enabled = false);
    this.getPushButtonsGroups().find(g => g === this.currentPushButtonsGroup).enabled = true;
  }

  private onCheckboxesChangeGroup() {
    this.getCheckboxesGroups().map(g => g.enabled = false);
    this.getCheckboxesGroups().find(g => g === this.currentCheckboxesGroup).enabled = true;
  }

  private onRadioButtonsChangeGroup() {
    this.getRadioButtonsGroups().map(g => g.enabled = false);
    this.getRadioButtonsGroups().find(g => g === this.currentRadioButtonsGroup).enabled = true;
  }

  onSelectionChange(currentOgcSelection?) {
    if (currentOgcSelection) {
      currentOgcSelection.enabled = !currentOgcSelection.enabled;
    }
  }

  private applyFilters() {
    let filterQueryString = '';
    const conditions = [];
    const currentGroups = [this.currentPushButtonsGroup, this.currentCheckboxesGroup, this.currentRadioButtonsGroup];
    for (const currentGroup of currentGroups) {
      if (currentGroup.computedSelectors) {
        currentGroup.computedSelectors.map(selectorBundle => {
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
      }
    }
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

  isMoreResults(bundle, type) {
    let selectorsLength = 0;
    for (const selectors of bundle.selectors) {
      selectorsLength++;
    }
    const index = type === 'radio' ? this.radioButtonsIndex : this.checkboxesIndex;
    return selectorsLength > index;
  }

  displayMoreResults(type) {
    type === 'radio' ? this.radioButtonsIndex += 5 : this.checkboxesIndex += 5;
    return;
  }

  isLessResults(bundle, type) {
    let selectorsLength = 0;
    for (const selectors of bundle.selectors) {
      selectorsLength++;
    }
    const index = type === 'radio' ? this.radioButtonsIndex : this.checkboxesIndex;
    return this.baseIndex !== index && selectorsLength > this.baseIndex;
  }

  displayLessResults(type) {
    type === 'radio' ? this.radioButtonsIndex = this.baseIndex : this.checkboxesIndex = this.baseIndex;
    return;
  }
}
