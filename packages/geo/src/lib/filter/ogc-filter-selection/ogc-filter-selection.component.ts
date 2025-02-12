import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DOMOptions, DOMService, DOMValue } from '@igo2/common/dom';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import {
  IgoOgcFilterObject,
  OgcAutocomplete,
  OgcFilterableDataSource,
  OgcPushButton,
  OgcSelectorBundle,
  SelectorGroup
} from '../../filter/shared/ogc-filter.interface';
import { MapBase } from '../../map';
import { OgcFilterTimeComponent } from '../ogc-filter-time/ogc-filter-time.component';
import { OgcFilterOperator } from '../shared/ogc-filter.enum';
import { OGCFilterService } from '../shared/ogc-filter.service';

@Component({
    selector: 'igo-ogc-filter-selection',
    templateUrl: './ogc-filter-selection.component.html',
    styleUrls: ['./ogc-filter-selection.component.scss'],
    providers: [DOMService],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgFor,
        NgIf,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        MatOptionModule,
        MatButtonToggleModule,
        NgStyle,
        MatCheckboxModule,
        MatRadioModule,
        MatIconModule,
        MatInputModule,
        MatAutocompleteModule,
        OgcFilterTimeComponent,
        AsyncPipe,
        IgoLanguageModule,
        MatChipsModule
    ]
})
export class OgcFilterSelectionComponent implements OnInit {
  @ViewChild('selection') sel: MatSelect;
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger })
  matAutocomplete: MatAutocompleteTrigger;

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: MapBase;

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
  private inputChangeAutocomplete = new Subject<void>();

  public ogcFilterOperator = OgcFilterOperator;

  public form: UntypedFormGroup;
  private ogcFilterWriter: OgcFilterWriter;
  public color = 'primary';
  public selectAllSelected = false;
  public selectEnabled$ = new BehaviorSubject(undefined);
  public selectEnableds$ = new BehaviorSubject([]);
  public autocompleteEnableds$ = new BehaviorSubject<string[]>([]);
  public filteredOgcAutocomplete: Record<string, Observable<any[]>> = {};

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
    this.currentSelectGroup.computedSelectors.forEach((compSelect) => {
      compSelect.selectors?.forEach((selector) => {
        value === selector
          ? (selector.enabled = true)
          : (selector.enabled = false);
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
    this.currentSelectGroup.computedSelectors.forEach((compSelect) => {
      compSelect.selectors?.forEach((selector) => {
        value.includes(selector)
          ? (selector.enabled = true)
          : (selector.enabled = false);
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
    this.currentAutocompleteGroup.computedSelectors.forEach((compSelect) => {
      compSelect.selectors?.forEach((selector) => {
        selector.enabled = false;
        for (const filter of filterList) {
          if (filter === selector.title) {
            selector.enabled = true;
          }
        }
      });
    });

    this.applyFiltersTimeout = setTimeout(() => {
      this.applyFilters();
    }, 750);
  }

  // Indicates the checked status of autocomplete checkboxes
  checkedStatus(autocompleteFilter: string): boolean {
    return this.autocompleteEnableds.includes(autocompleteFilter);
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
      pushButtons: [''],
      radioButtons: [''],
      pushButtonsGroup: ['', [Validators.required]],
      checkboxesGroup: ['', [Validators.required]],
      radioButtonsGroup: ['', [Validators.required]],
      selectGroup: ['', [Validators.required]],
      select: [''],
      selectMulti: [''],
      autocompleteGroup: ['', [Validators.required]],
      autocomplete: ['']
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
          this.datasource.options.ogcFilters.pushButtons.groups.find(
            (group) => group.enabled
          ) || this.datasource.options.ogcFilters.pushButtons.groups[0];
      }
      if (this.datasource.options.ogcFilters.checkboxes) {
        this.currentCheckboxesGroup =
          this.datasource.options.ogcFilters.checkboxes.groups.find(
            (group) => group.enabled
          ) || this.datasource.options.ogcFilters.checkboxes.groups[0];
      }
      if (this.datasource.options.ogcFilters.radioButtons) {
        this.currentRadioButtonsGroup =
          this.datasource.options.ogcFilters.radioButtons.groups.find(
            (group) => group.enabled
          ) || this.datasource.options.ogcFilters.radioButtons.groups[0];
      }
      if (this.datasource.options.ogcFilters.select) {
        this.currentSelectGroup =
          this.datasource.options.ogcFilters.select.groups.find(
            (group) => group.enabled
          ) || this.datasource.options.ogcFilters.select.groups[0];
        this.initSelectEnabled();
        await this.getSelectDomValues();
      }
      if (this.datasource.options.ogcFilters.autocomplete) {
        this.currentAutocompleteGroup =
          this.datasource.options.ogcFilters.autocomplete.groups.find(
            (group) => group.enabled
          ) || this.datasource.options.ogcFilters.autocomplete.groups[0];
        this.initAutocompleteEnableds();
        await this.getAutocompleteDomValues();
      }
      this.applyFilters();
    }

    this.form
      .get('pushButtonsGroup')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.onPushButtonsChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('checkboxesGroup')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.onCheckboxesChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('radioButtonsGroup')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.onRadioButtonsChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('selectGroup')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.onSelectChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('autocompleteGroup')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.onAutocompleteChangeGroup();
        this.applyFilters();
      });
    this.form
      .get('pushButtons')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });
    this.form
      .get('radioButtons')
      .valueChanges.pipe(debounceTime(750))
      .subscribe(() => {
        this.applyFilters();
      });

    // Debounce time for autocomplete filter options - value chosen arbitrarily
    this.inputChangeAutocomplete.pipe().subscribe(() => {
      this.getAutocompleteDomValues();
    });
  }

  private initSelectEnabled() {
    const enableds = [];
    let enabled;
    this.currentSelectGroup.computedSelectors.forEach((compSelect) => {
      if (compSelect.multiple) {
        compSelect.selectors?.forEach((selector) => {
          if (selector.enabled) {
            enableds.push(selector);
          }
        });
        this.selectEnableds = enableds;
        this.form.controls['selectMulti'].setValue(enableds);
      } else {
        compSelect.selectors?.forEach((selector) => {
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

  private initAutocompleteEnableds() {
    const enabled = [];
    this.currentAutocompleteGroup.computedSelectors.forEach((compSelect) => {
      compSelect.selectors?.forEach((selector) => {
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
          for (const domOptions of this.configService.getConfig<DOMOptions[]>(
            'dom'
          )) {
            if (
              domSelector.id === domOptions.id ||
              domSelector.name === domOptions.name
            ) {
              filterDOM = {
                id: domOptions.id,
                url: domOptions.url,
                name: domOptions.name,
                values: domOptions.values
              };
            }
          }
          filterDOM.url
            ? (domValues = (await this.domService.getDomValuesFromURL(
                filterDOM
              )) as DOMValue[])
            : (domValues = filterDOM.values);

          if (domValues) {
            const newBundle = bundle;
            newBundle.selectors = [];
            let selector;
            for (const value of domValues) {
              if (bundle.multiple) {
                let enabled;
                this.selectEnableds?.find((sel) => sel.title === value.value)
                  ? (enabled = true)
                  : (enabled = false);
                selector = {
                  title: value.value,
                  enabled,
                  filters: {
                    operator: domSelector.operator,
                    propertyName: domSelector.propertyName,
                    expression: value.id
                  }
                };
              } else {
                selector = {
                  title: value.value,
                  enabled:
                    this.selectEnabled?.title === value.value ? true : false,
                  filters: {
                    operator: domSelector.operator,
                    propertyName: domSelector.propertyName,
                    expression: value.id
                  }
                };
              }
              newBundle.selectors.push(selector);
            }
            this.getSelectGroups()
              .find((group) => group.ids.includes(newBundle.id))
              .computedSelectors.find(
                (comp) => comp.title === newBundle.title
              ).selectors = newBundle.selectors;
          }
        }
        this.initSelectEnabled();
      }
    }
  }

  // Trigger filter refresh (with debounce)
  onInputChange() {
    this.inputChangeAutocomplete.next();
  }

  async getAutocompleteDomValues() {
    for (const bundle of this.datasource.options.ogcFilters.autocomplete
      .bundles) {
      if (bundle.domSelectors) {
        let domValues: DOMValue[];
        for (const domSelector of bundle.domSelectors) {
          let filterDOM: DOMOptions;
          for (const configDom of this.configService.getConfig<DOMOptions[]>(
            'dom'
          )) {
            if (
              domSelector.id === configDom.id ||
              domSelector.name === configDom.name
            ) {
              filterDOM = {
                id: configDom.id,
                url: configDom.url,
                name: configDom.name,
                values: configDom.values
              };
            }
          }
          filterDOM.url
            ? (domValues = (await this.domService.getDomValuesFromURL(
                filterDOM
              )) as DOMValue[])
            : (domValues = filterDOM.values);

          if (domValues) {
            const newBundle: OgcSelectorBundle = bundle;
            newBundle.selectors = [];
            let selector: OgcAutocomplete;
            for (const domValue of domValues) {
              selector = {
                title: domValue.id as string,
                enabled: this.autocompleteEnableds?.includes(domValue.value)
                  ? true
                  : false,
                filters: {
                  operator: domSelector.operator,
                  propertyName: domSelector.propertyName,
                  expression: domValue.value
                }
              };
              newBundle.selectors.push(selector);
            }
            this.getAutocompleteGroups()
              .find((group: SelectorGroup) => group.ids.includes(newBundle.id))
              .computedSelectors.find(
                (computedSelector) => computedSelector.title === newBundle.title
              ).selectors = newBundle.selectors;
          }
        }

        this.filteredOgcAutocomplete[bundle.id] = new Observable<any[]>();
        this.cdRef.detectChanges();
        this.filteredOgcAutocomplete[bundle.id] = of(domValues);
      }
    }
  }

  getButtonColor(pushButton: OgcPushButton) {
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
    this.getPushButtonsGroups().map((group) => (group.enabled = false));
    this.getPushButtonsGroups().find(
      (group) => group === this.currentPushButtonsGroup
    ).enabled = true;
  }

  private onCheckboxesChangeGroup() {
    this.getCheckboxesGroups().map((group) => (group.enabled = false));
    this.getCheckboxesGroups().find(
      (group) => group === this.currentCheckboxesGroup
    ).enabled = true;
  }

  private onRadioButtonsChangeGroup() {
    this.getRadioButtonsGroups().map((group) => (group.enabled = false));
    this.getRadioButtonsGroups().find(
      (group) => group === this.currentRadioButtonsGroup
    ).enabled = true;
  }

  private onSelectChangeGroup() {
    this.getSelectGroups().map((group) => (group.enabled = false));
    this.getSelectGroups().find(
      (group) => group === this.currentSelectGroup
    ).enabled = true;
  }

  private onAutocompleteChangeGroup() {
    this.getAutocompleteGroups().map((group) => (group.enabled = false));
    this.getAutocompleteGroups().find(
      (group) => group === this.currentAutocompleteGroup
    ).enabled = true;
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
    this.currentRadioButtonsGroup.computedSelectors.forEach((compSelect) => {
      compSelect.selectors.map((selector) => (selector.enabled = false));

      this.applyFiltersTimeout = setTimeout(() => {
        this.applyFilters();
      }, 750);
    });
  }

  emptySelect() {
    this.selectEnabled = undefined;
  }

  emptyAutocomplete() {
    this.autocompleteEnableds = [];
    this.form.controls['autocomplete'].setValue('');
    this.form.controls['autocomplete'].markAsUntouched();
  }

  toggleAllSelection() {
    if (this.selectAllSelected) {
      const enableds = [];
      this.currentSelectGroup.computedSelectors.forEach((compSelect) => {
        compSelect.selectors?.forEach((selector) => {
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

  toggleAutocompleteOption(event: Event, toggledFilter: string) {
    event.stopPropagation();
    this.toggleSelection(toggledFilter);
  }

  toggleSelection(toggledFilter: string) {
    if (this.autocompleteEnableds.includes(toggledFilter)) {
      this.autocompleteEnableds = this.autocompleteEnableds.filter(
        (enabledFilter) => enabledFilter !== toggledFilter
      );
    } else {
      this.autocompleteEnableds = [...this.autocompleteEnableds, toggledFilter];
    }
  }

  // Value displayed in the autocomplete input box
  displayFn(): string {
    return '';
  }

  // Applies filters based on the current group of all filter selection types
  private applyFilters() {
    let filterQueryString = '';
    const conditions = [];
    const currentGroups = [
      this.currentPushButtonsGroup,
      this.currentCheckboxesGroup,
      this.currentRadioButtonsGroup,
      this.currentSelectGroup,
      this.currentAutocompleteGroup
    ];
    for (const currentGroup of currentGroups) {
      if (currentGroup.computedSelectors) {
        currentGroup.computedSelectors.map((selectorBundle) => {
          const bundleCondition = [];
          selectorBundle.selectors
            ?.filter((ogcSelector) => ogcSelector.enabled === true)
            .forEach((enabledSelector) =>
              bundleCondition.push(enabledSelector.filters)
            );
          if (bundleCondition.length >= 1) {
            if (bundleCondition.length === 1) {
              conditions.push(bundleCondition[0]);
            } else {
              conditions.push({
                logical: selectorBundle.logical,
                filters: bundleCondition
              });
            }
          }
        });
      }
    }
    if (this.isTemporalOperator() && this._currentFilter.active) {
      conditions.push(
        this.datasource.options.ogcFilters.interfaceOgcFilters[0]
      );
    }
    if (conditions.length >= 1) {
      filterQueryString = this.ogcFilterWriter.buildFilter(
        conditions.length === 1
          ? conditions[0]
          : ({ logical: 'And', filters: conditions } as IgoOgcFilterObject)
      );
    }
    if (this.datasource.options.type === 'wms') {
      this.ogcFilterService.filterByOgc(
        this.datasource as WMSDataSource,
        filterQueryString
      );
    }
    if (this.datasource.options.type === 'wfs') {
      // TODO: Check how to prevent wfs to refresh when filter icon is pushed...
      this.datasource.ol.refresh();
    }
    this.datasource.setOgcFilters(this.datasource.options.ogcFilters, true);
  }

  isMoreResults(bundle, type) {
    const selectorsLength = bundle.selectors.length;
    const index =
      type === 'radio' ? this.radioButtonsIndex : this.checkboxesIndex;
    return selectorsLength > index;
  }

  displayMoreResults(type) {
    type === 'radio'
      ? (this.radioButtonsIndex += 5)
      : (this.checkboxesIndex += 5);
    return;
  }

  isLessResults(bundle, type) {
    const selectorsLength = bundle.selectors.length;
    const index =
      type === 'radio' ? this.radioButtonsIndex : this.checkboxesIndex;
    return this.baseIndex !== index && selectorsLength > this.baseIndex;
  }

  displayLessResults(type) {
    type === 'radio'
      ? (this.radioButtonsIndex = this.baseIndex)
      : (this.checkboxesIndex = this.baseIndex);
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
        (filter) => filter.filterid === this.currentFilter.filterid
      )[detectedProperty] = value;

      if (refreshFilter) {
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
