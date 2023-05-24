import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';

import { ConfigService } from '@igo2/core';
import { DOMService, DOMValue } from '@igo2/common';

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
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';
import { OgcFilterOperator } from '../shared/ogc-filter.enum';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'igo-ogc-filter-selection',
  templateUrl: './ogc-filter-selection.component.html',
  styleUrls: ['./ogc-filter-selection.component.scss'],
  providers: [ DOMService ]
})
export class OgcFilterSelectionComponent implements OnInit {

  @ViewChild('selection') sel: MatSelect;

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  @Input() checkboxesIndex = 5;
  @Input() radioButtonsIndex = 5;
  @Input() baseIndex = 5;

  @Input()
  get currentFilter(): any {
    return this._currentFilter;
  }
  set currentFilter(value) {
    this._currentFilter = value;
    if (this._currentFilter?.sliderOptions) {
      this._currentFilter.sliderOptions.enabled = false; // remove slider toggle (animation temporelle)
    }
  }
  private _currentFilter: any;

  public ogcFilterOperator = OgcFilterOperator;

  public form: UntypedFormGroup;
  private ogcFilterWriter: OgcFilterWriter;
  public color = 'primary';
  public selectAllSelected = false;
  public selectEnabled$ = new BehaviorSubject(undefined);
  public selectEnableds$ = new BehaviorSubject([]);
  public autocompleteEnableds$ = new BehaviorSubject([])
  public filteredOgcAutocomplete: {[key: string]: Observable<unknown> } = {};
  public activeFilters = [];

  public applyFiltersTimeout;

  get ogcFiltersSelectors() {
    const ogcSelector = [];
    if (this.datasource?.options?.ogcFilters?.pushButtons) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.pushButtons);
    }
    if (this.datasource?.options?.ogcFilters?.checkboxes) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.checkboxes);
    }
    if (this.datasource?.options?.ogcFilters?.radioButtons) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.radioButtons);
    }
    if (this.datasource?.options?.ogcFilters?.select) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.select);
    }
    if (this.datasource?.options?.ogcFilters?.autocomplete) {
      ogcSelector.push(this.datasource?.options?.ogcFilters?.autocomplete);
    }
    ogcSelector.sort((a, b) => {
      if (a.order < b.order) {
        return -1;
      }
      if (a.order > b.order) {
        return 1;
      }
      return 0;
    });
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

  get currentSelectGroup() {
    return this.form.get('selectGroup').value;
  }
  set currentSelectGroup(value) {
    this.form.patchValue({ selectGroup: value });
    this.cdRef.detectChanges();
  }

  get currentAutocompleteGroup() {
    return this.form.get('autocompleteGroup').value;
  }
  set currentAutocompleteGroup(value) {
    this.form.patchValue({ autocompleteGroup: value });
    this.cdRef.detectChanges();
  }

  get selectEnabled() {
    return this.selectEnabled$.value;
  }

  set selectEnabled(value) {
    this.selectEnabled$.next(value);
    clearTimeout(this.applyFiltersTimeout);
    this.currentSelectGroup.computedSelectors.forEach(compSelect => {
      compSelect.selectors?.forEach(selector => {
        value === selector ? selector.enabled = true : selector.enabled = false;
      });
    });

    this.applyFiltersTimeout = setTimeout(() => {
      this.applyFilters();
    }, 750);
  }

  get selectEnableds() {
    return this.selectEnableds$.value;
  }

  set selectEnableds(value) {
    this.selectEnableds$.next(value);
    clearTimeout(this.applyFiltersTimeout);
    this.currentSelectGroup.computedSelectors.forEach(compSelect => {
      compSelect.selectors?.forEach(selector => {
        value.includes(selector) ? selector.enabled = true : selector.enabled = false;
      });
    });

    this.applyFiltersTimeout = setTimeout(() => {
      this.applyFilters();
    }, 750);
  }

  get autocompleteEnableds() {
    return this.autocompleteEnableds$.value;
  }

    // Updates the currentAutocompleteGroup and applies filters
    set autocompleteEnableds(filterList) {
      this.autocompleteEnableds$.next(filterList);
      clearTimeout(this.applyFiltersTimeout);
      this.currentAutocompleteGroup.computedSelectors.forEach(compSelect => {
        compSelect.selectors?.forEach(selector => {
          selector.enabled = false;
          for(let filter of filterList){
            if(filter === selector.title){
              selector.enabled = true;
            }
          }
        });
      });

    this.applyFiltersTimeout = setTimeout(() => {
      this.applyFilters();
    }, 750);
  }


  checkedStatus(autocompleteFilter): boolean{
    console.log("this.autocompleteEnableds: ", JSON.stringify(this.autocompleteEnableds));
    console.log("ogcAutocomplete.value: ", autocompleteFilter);
    console.log("this bool: ", this.activeFilters.includes(autocompleteFilter));
    console.log("ogcAutocomplete.enabled: ")
    return this.activeFilters.includes(autocompleteFilter);
  }

  constructor(
    private ogcFilterService: OGCFilterService,
    private formBuilder: UntypedFormBuilder,
    private domService: DOMService,
    private configService: ConfigService,
    private cdRef: ChangeDetectorRef
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      pushButtons: ['', [Validators.required]],
      radioButtons: ['', [Validators.required]],
      pushButtonsGroup: ['', [Validators.required]],
      checkboxesGroup: ['', [Validators.required]],
      radioButtonsGroup: ['', [Validators.required]],
      selectGroup: ['', [Validators.required]],
      select: ['', [Validators.required]],
      selectMulti: ['', [Validators.required]],
      autocompleteGroup: ['', [Validators.required]],
      autocomplete: ['', [Validators.required]]
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

  getSelectGroups(): SelectorGroup[] {
    if (this.datasource?.options?.ogcFilters?.select) {
      return this.datasource.options.ogcFilters.select.groups;
    }
  }

  getAutocompleteGroups(): SelectorGroup[] {
    if (this.datasource?.options?.ogcFilters?.autocomplete) {
      return this.datasource.options.ogcFilters.autocomplete.groups;
    }
  }

  async ngOnInit() {
    if (this.datasource.options.ogcFilters) {
      if (this.datasource.options.ogcFilters.pushButtons) {
        this.currentPushButtonsGroup =
          this.datasource.options.ogcFilters.pushButtons.groups.find(group => group.enabled) ||
          this.datasource.options.ogcFilters.pushButtons.groups[0];
      }
      if (this.datasource.options.ogcFilters.checkboxes) {
        this.currentCheckboxesGroup =
          this.datasource.options.ogcFilters.checkboxes.groups.find(group => group.enabled) ||
          this.datasource.options.ogcFilters.checkboxes.groups[0];
      }
      if (this.datasource.options.ogcFilters.radioButtons) {
        this.currentRadioButtonsGroup =
          this.datasource.options.ogcFilters.radioButtons.groups.find(group => group.enabled) ||
          this.datasource.options.ogcFilters.radioButtons.groups[0];
      }
      if (this.datasource.options.ogcFilters.select) {
        this.currentSelectGroup =
          this.datasource.options.ogcFilters.select.groups.find(group => group.enabled) ||
          this.datasource.options.ogcFilters.select.groups[0];
        this.getSelectEnabled();
        await this.getSelectDomValues();
      }
      if (this.datasource.options.ogcFilters.autocomplete) {
        this.currentAutocompleteGroup =
          this.datasource.options.ogcFilters.autocomplete.groups.find(group => group.enabled) ||
          this.datasource.options.ogcFilters.autocomplete.groups[0];
        console.log("this.getAutocompleteEnableds: ", JSON.stringify(this.autocompleteEnableds));
        this.getAutocompleteEnableds();
        await this.getAutocompleteDomValues();
      }
      this.applyFilters();
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
      .get('selectGroup')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.onSelectChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('autocompleteGroup')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.onAutocompleteChangeGroup();
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
      .get('radioButtons')
      .valueChanges
      .pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private getSelectEnabled() {
    const enableds = [];
    let enabled;
    this.currentSelectGroup.computedSelectors.forEach(compSelect => {
      if (compSelect.multiple) {
        compSelect.selectors?.forEach(selector => {
          if (selector.enabled) {
            enableds.push(selector);
          }
        });
        this.selectEnableds = enableds;
        this.form.controls['selectMulti'].setValue(enableds);
      } else {
        compSelect.selectors?.forEach(selector => {
          if (selector.enabled) {
            enabled = selector;
          }
        });
        this.form.controls['select'].reset(enabled);
        this.selectEnabled$.subscribe((value) => {
          if (this.form.controls['select'].value !== value) {
            this.form.controls['select'].setValue(value);
          }
        });
        this.selectEnabled = enabled;
      }
    });
  }

  private getAutocompleteEnableds() {
    let enabled = [];
    this.currentAutocompleteGroup.computedSelectors.forEach(compSelect => {
      compSelect.selectors?.forEach(selector => {
        if (selector.enabled) {
          const dom = {
            id: selector.filters.expression,
            value: selector.title
          };
          enabled.push(selector.title);
          this.form.controls['autocomplete'].setValue(dom);
        }
      });
      this.autocompleteEnableds = enabled;
    });
  }

  getToolTip(selector): string {
    let toolTip;
    if (selector.tooltip) {
      if (Array.isArray(selector.tooltip)) {
        toolTip = selector.tooltip.join('\n');
      } else {
        toolTip = selector.tooltip;
      }
    }
    return toolTip || '';
  }

  async getSelectDomValues() {
    for (const bundle of this.datasource.options.ogcFilters.select.bundles) {
      if (bundle.domSelectors) {
        let domValues;
        for (const domSelector of bundle.domSelectors) {
          let filterDOM;
          for (const domOptions of this.configService.getConfig('dom')) {
            if (domSelector.id === domOptions.id || domSelector.name === domOptions.name) {
              filterDOM = {
                id: domOptions.id,
                url: domOptions.url,
                name: domOptions.name,
                values: domOptions.values
              };
            }
          }
          filterDOM.url ? domValues = await this.domService.getDom(filterDOM) as DOMValue[] :
            domValues = filterDOM.values;

          if (domValues) {
            let newBundle = bundle;
            newBundle.selectors = [];
            let selector;
            for (const value of domValues) {
              if (bundle.multiple) {
                let enabled;
                this.selectEnableds?.find(sel => sel.title === value.value) ? enabled = true : enabled = false;
                selector = {
                  title: value.value,
                  enabled,
                  filters: {
                    operator: domSelector.operator,
                    propertyName: domSelector.propertyName,
                    expression: value.id,
                  }
                };
              } else {
                selector = {
                  title: value.value,
                  enabled: this.selectEnabled?.title === value.value ?
                    true : false,
                  filters: {
                    operator: domSelector.operator,
                    propertyName: domSelector.propertyName,
                    expression: value.id,
                  }
                };
              }
              newBundle.selectors.push(selector);
            }
            this.getSelectGroups().find(group => group.ids.includes(newBundle.id)).computedSelectors
              .find(comp => comp.title === newBundle.title).selectors = newBundle.selectors;
          }
        }
        this.getSelectEnabled();
      }
    }
  }

  async getAutocompleteDomValues() {
    for (const bundle of this.datasource.options.ogcFilters.autocomplete.bundles) {
      if (bundle.domSelectors) {
        let domValues;
        for (const domSelector of bundle.domSelectors) {
          let filterDOM;
          for (const domOptions of this.configService.getConfig('dom')) {
            if (domSelector.id === domOptions.id || domSelector.name === domOptions.name) {
              filterDOM = {
                id: domOptions.id,
                url: domOptions.url,
                name: domOptions.name,
                values: domOptions.values
              };
            }
          }
          filterDOM.url ? domValues = await this.domService.getDom(filterDOM) as DOMValue[] :
            domValues = filterDOM.values;

          if (domValues) {
            let newBundle = bundle;
            newBundle.selectors = [];
            let selector;
            for (const value of domValues) {
              selector = {
                title: value.value,
                enabled: this.autocompleteEnableds && this.autocompleteEnableds.includes(value.value) ?
                  true : false,
                filters: {
                  operator: domSelector.operator,
                  propertyName: domSelector.propertyName,
                  expression: value.id,
                }
              };
              newBundle.selectors.push(selector);
            }
            this.getAutocompleteGroups().find(group => group.ids.includes(newBundle.id)).computedSelectors
              .find(comp => comp.title === newBundle.title).selectors = newBundle.selectors;
          }
        }

        this.filteredOgcAutocomplete[bundle.id] = new Observable<any[]>();
        this.cdRef.detectChanges();
        this.filteredOgcAutocomplete[bundle.id] = this.form.controls['autocomplete'].valueChanges.pipe(
          map(value => {
            if (value.length) {
              return domValues?.filter((option) => {
                const filterNormalized = value ? value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
                const featureNameNormalized = option.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return featureNameNormalized.includes(filterNormalized);
              });
            }
          })
        );
      }
    }
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

  getButtonColor(pushButton: OgcPushButton): {} {
    let styles;
    if (pushButton.color && pushButton.enabled) {
      styles = {
        'background-color': `rgba(${pushButton.color})`
      };
    }
    return styles;
  }

  bundleIsVertical(bundle: OgcSelectorBundle): boolean {
    return bundle.vertical ? bundle.vertical : false;
  }

  private onPushButtonsChangeGroup() {
    this.getPushButtonsGroups().map(group => group.enabled = false);
    this.getPushButtonsGroups().find(group => group === this.currentPushButtonsGroup).enabled = true;
  }

  private onCheckboxesChangeGroup() {
    this.getCheckboxesGroups().map(group => group.enabled = false);
    this.getCheckboxesGroups().find(group => group === this.currentCheckboxesGroup).enabled = true;
  }

  private onRadioButtonsChangeGroup() {
    this.getRadioButtonsGroups().map(group => group.enabled = false);
    this.getRadioButtonsGroups().find(group => group === this.currentRadioButtonsGroup).enabled = true;
  }

  private onSelectChangeGroup() {
    this.getSelectGroups().map(group => group.enabled = false);
    this.getSelectGroups().find(group => group === this.currentSelectGroup).enabled = true;
  }

  private onAutocompleteChangeGroup() {
    this.getAutocompleteGroups().map(group => group.enabled = false);
    this.getAutocompleteGroups().find(group => group === this.currentAutocompleteGroup).enabled = true;
  }

  onSelectionChange(currentOgcSelection?, selectorType?) {
    clearTimeout(this.applyFiltersTimeout);
    if (selectorType === 'radioButton') {
      this.emptyRadioButtons();
    }

    if (currentOgcSelection) {
      currentOgcSelection.enabled = !currentOgcSelection.enabled;
    }
    this.applyFiltersTimeout = setTimeout(() => {
      this.applyFilters();
    }, 750);
  }

  emptyRadioButtons() {
    this.currentRadioButtonsGroup.computedSelectors.forEach(compSelect => {
      compSelect.selectors.map(selector => selector.enabled = false);

      this.applyFiltersTimeout = setTimeout(() => {
        this.applyFilters();
      }, 750);
   });
  }

  emptySelect() {
    this.selectEnabled = undefined;
  }

  emptyAutocomplete() {
    console.log("emptyAutocomplete");
    this.autocompleteEnableds = [];
    this.form.controls['autocomplete'].setValue('');
    this.form.controls['autocomplete'].markAsUntouched();
    this.activeFilters = [];
  }

  toggleAllSelection() {
    if (this.selectAllSelected) {
      const enableds = [];
      this.currentSelectGroup.computedSelectors.forEach(compSelect => {
        compSelect.selectors?.forEach(selector => {
          enableds.push(selector);
        });
      });
      this.sel.options.forEach((item: MatOption) => item.select());
      this.selectEnableds = enableds;
    } else {
      this.sel.options.forEach((item: MatOption) => item.deselect());
      this.selectEnableds = [];
    }
  }

  selectOptionClick(value, bundle, event?) {
    if (bundle.multiple) {
      const enableds = this.selectEnableds;
      let newStatus = true;
      this.sel.options.forEach((item: MatOption) => {
        if (!item.selected) {
          newStatus = false;
        }
      });
      this.selectAllSelected = newStatus;
      if (event.isUserInput) {
        if (enableds.length) {
          for (const enabled of enableds) {
            if (enabled.title === value.title) {
              if (enabled.enabled && value.enabled) {
                enableds.splice(enableds.indexOf(enabled), 1);
                this.selectEnableds = enableds;
                break;
              }
            } else if (enableds.indexOf(enabled) === enableds.length - 1) {
              enableds.push(value);
              this.selectEnableds = enableds;
              break;
            }
          }
        } else {
          enableds.push(value);
          this.selectEnableds = enableds;
        }
      }
    } else {
      this.selectEnabled = value;
    }
  }

  // Modifies autocompleteEnableds to reflect active filters
  autocompleteOptionClick(toggledFilter) {
    let removed = false;
    console.log("autocompleteOptionClick autocompleteEnableds: ", this.autocompleteEnableds);
    for (let filter of this.autocompleteEnableds) {
      if(toggledFilter === filter){
        const temp = this.autocompleteEnableds.filter((element) => element !== toggledFilter);
        this.autocompleteEnableds = temp;
        removed = true;
      }
    }
    if(!removed){
      const temp = this.autocompleteEnableds;
      temp.push(toggledFilter);
      this.autocompleteEnableds = temp;
    }

    console.log("activeFilters before: ", this.activeFilters);
    if(this.activeFilters.includes(toggledFilter)){
      console.log("activeFilter REMOVING element");
      this.activeFilters = this.activeFilters.filter((element) => element !== toggledFilter);
    }else{
      console.log("activeFilters ADDING element");
      this.activeFilters.push(toggledFilter);
    }
    console.log("activeFilters after: ", this.activeFilters);
  }

  // Value displayed in the autocomplete input box
  displayFn(dom): string {
    return "";
  }

  // Applies filters based on the current group of all filter selection types
  private applyFilters() {
    let filterQueryString = '';
    const conditions = [];
    const currentGroups = [this.currentPushButtonsGroup, this.currentCheckboxesGroup,
      this.currentRadioButtonsGroup, this.currentSelectGroup, this.currentAutocompleteGroup];
    for (const currentGroup of currentGroups) {
      if (currentGroup.computedSelectors) {
        currentGroup.computedSelectors.map(selectorBundle => {
          const bundleCondition = [];
          selectorBundle.selectors?.filter(ogcSelector => ogcSelector.enabled === true)
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
    if (this.isTemporalOperator() && this._currentFilter.active) {
      conditions.push(this.datasource.options.ogcFilters.interfaceOgcFilters[0]);
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
    this.datasource.setOgcFilters(this.datasource.options.ogcFilters, true);
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

  isTemporalOperator() {
    return (
      this.currentFilter?.operator?.toLowerCase() ===
      this.ogcFilterOperator.During.toLowerCase()
    );
  }

  changeProperty(value: any, pos?: number, refreshFilter = true) {
    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      this.datasource.options.ogcFilters.interfaceOgcFilters.find(
        filter => filter.filterid === this.currentFilter.filterid
      )[detectedProperty] = value;

      if ( refreshFilter ) {
        this.applyFilters();
      }
    }
  }

  detectProperty(pos?: number): string {
    switch (this.currentFilter.operator) {
      case OgcFilterOperator.PropertyIsNotEqualTo:
      case OgcFilterOperator.PropertyIsEqualTo:
      case OgcFilterOperator.PropertyIsGreaterThan:
      case OgcFilterOperator.PropertyIsGreaterThanOrEqualTo:
      case OgcFilterOperator.PropertyIsLessThan:
      case OgcFilterOperator.PropertyIsLessThanOrEqualTo:
        return 'expression';
      case OgcFilterOperator.PropertyIsLike:
        return 'pattern';
      case OgcFilterOperator.PropertyIsBetween:
        return pos && pos === 1
          ? 'lowerBoundary'
          : pos && pos === 2
          ? 'upperBoundary'
          : undefined;
      case OgcFilterOperator.During:
        return pos && pos === 1
          ? 'begin'
          : pos && pos === 2
          ? 'end'
          : undefined;
      default:
        return;
    }
  }
}
