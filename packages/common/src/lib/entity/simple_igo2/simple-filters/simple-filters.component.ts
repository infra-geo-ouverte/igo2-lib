import { FeatureCollection } from 'geojson';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SimpleFilters, SimpleFilter, TypeOptions, Option } from './simple-filters.interface';
import { ConfigService } from '@igo2/core';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subscription } from 'rxjs';

@Component({
  selector: 'igo-simple-filters',
  templateUrl: './simple-filters.component.html',
  styleUrls: ['./simple-filters.component.scss']
})
export class SimpleFiltersComponent implements OnInit, OnDestroy {
  @Output() filterSelection = new EventEmitter();

  public terrAPIBaseURL: string = "https://geoegl.msp.gouv.qc.ca/apis/terrapi/"; // base URL of the terrAPI API
  public terrAPITypes: Array<string>; // an array of strings containing the types from terrAPI
  public simpleFiltersConfig: SimpleFilters; // simpleFilters config input by the user in the config file
  public filteringType: string; // the type of filtering to apply to the elements
  public allTypesOptions: Array<TypeOptions> = []; // array that contains all the options for each filter
  public filteredTypesOptions: Array<TypeOptions> = []; // array that contains the filtered options for each filter

  public filtersFormGroup: FormGroup; // form group containing the controls (one control per filter)
  public previousFiltersFormGroupValue: object; // object representing the previous value held in each control
  public filtersFormGroupValueChange$$: Subscription; // subscription to form group value changes

  constructor(private configService: ConfigService,
    private http: HttpClient,
    private formBuilder: FormBuilder) {}

  // getter of the form group controls
  get controls(): {[key: string]: AbstractControl} {
    return this.filtersFormGroup.controls;
  }

  public async ngOnInit(): Promise<void> {
    // get the simpleFilters config input by the user in the config file
    this.simpleFiltersConfig = this.configService.getConfig('simpleFilters');

    this.filteringType = this.simpleFiltersConfig.type;

    // create a form group used to hold various controls
    this.filtersFormGroup = this.formBuilder.group({});

    // get all the types in terrAPI
    const types: Array<string> = await this.getTerrAPITypes();

    if (types) {
      this.terrAPITypes = types;
    }

    // for each filter input by the user...
    for (let filter of this.simpleFiltersConfig.filters) {
      if (filter.type) {
        // ...get the options from terrAPI and push them in the array containing all the options and add a control in the form group
        const typeOptions: TypeOptions = await this.getOptionsOfFilter(filter);

        if (typeOptions) {
          this.allTypesOptions.push(typeOptions);
          this.filtersFormGroup.addControl(typeOptions.type, this.formBuilder.control(''));
        };
      }
    }
    // deep-copy the array containing all the options to the one that will contain the filtered options (same at the start)
    this.filteredTypesOptions = JSON.parse(JSON.stringify(this.allTypesOptions));

    // set previous value of the form group (each control value is an empty string at the start)
    this.previousFiltersFormGroupValue = this.filtersFormGroup.value;

    // when the user types in a field, filter the options of the filter
    this.filtersFormGroupValueChange$$ = this.filtersFormGroup.valueChanges.subscribe((spatialFiltersFormCurrentValue: object) => {
      this.filterOptions(spatialFiltersFormCurrentValue);
      this.filterSelection.emit(this.filtersFormGroup.value);
    });
  }

  public ngOnDestroy() {
    // unsubscribe from form group value change
    this.filtersFormGroupValueChange$$.unsubscribe();
  }

  /**
   * @description Used to display the name of a value in a field
   * @param value An object representing the current value of the control
   * @returns A string representing the value to display in the field
   */
  public displayName(value: Option): string {
    return value?.nom ? value.nom : '';
  }

  /**
   * @description Get an array containg all the types from terrAPI
   * @returns An array of string containing the types of terrAPI
   */

  private async getTerrAPITypes(): Promise<Array<string>> {
    const url: string = this.terrAPIBaseURL + "types";

    let response: Array<string>;

    await this.http.get<Array<string>>(url).pipe(map((types: Array<string>) => {
      response = types;
      return types;
    })).toPromise();

    return response;
  }

  /**
   * @description Get all the options for a given filter
   * @param filter A SimpleFilter object representing the filter
   * @returns The options for the given filter in the TypeOptions format
   */
  private async getOptionsOfFilter(filter: SimpleFilter): Promise<TypeOptions> {
    if (this.terrAPITypes.includes(filter.type)) {
      // get options from terrAPI
      const featureCollection: FeatureCollection = await this.getOptionsFromTerrAPI(true, filter.type);

      // when options (feature collection) are returned...
      if (featureCollection) {
        let options: Array<Option> = [];
        featureCollection.features.forEach(feature => {
          // ...push type, code and name of each option
          options.push({type: filter.type, code: feature.properties.code, nom: feature.properties.nom});
        });
        const typeOptions: TypeOptions = {type: filter.type, description: filter.description, options: options};

        return typeOptions;
      }
    } else {
      const typeOptions: TypeOptions = {type: filter.type, description: filter.description};

      return typeOptions;
    }
  }
  /**
   * @description Get all or some options from a call to terrAPI
   * @param returnAll A boolean representing if the call should return all of the options or if the options should be filtered
   * @param sType A string representing the source 'type' parameter from terrAPI
   * @param sCode A string representing the source 'code' parameter from terrAPI
   * @param tType A string representing the target 'type' parameter from terrAPI
   * @returns A feature collection from terrAPI
   */
  private async getOptionsFromTerrAPI(returnAll: boolean, sType: string, sCode?: string, tType?: string): Promise<FeatureCollection> {
    // construct the URL
    const url: string = returnAll ? this.terrAPIBaseURL + sType : this.terrAPIBaseURL + `${sType}/${sCode}/${tType}`;

    // set a sorting parameter to sort features by name in alphabetical order
    const params: HttpParams = new HttpParams().set('sort', 'nom');
    let response: FeatureCollection;

    // make the call to terrAPI and return the feature collection (options)
    await this.http.get<FeatureCollection>(url, {params}).pipe(map((featureCollection: FeatureCollection) => {
      response = featureCollection;
      return featureCollection;
    })).toPromise();

    return response;
  }

  /**
   * @description Get the label of a given field
   * @param controlName A string representing the name of a control
   * @returns A string representing the label of a filter
   */
  public getLabel(controlName: string): string {
    // find and return the correct description
    return this.simpleFiltersConfig.filters.find((filter: SimpleFilter) => filter.type === controlName).description;
  }

  /**
   * @description Find and get the auto-complete options of a given field
   * @param formControlName A string representing the name of a control
   * @returns An array representing the options
   */
  public getOptions(formControlName: string): Array<Option> {
    return this.filteredTypesOptions.find(typeOptions => typeOptions.type === formControlName).options;
  }

  /**
   * @description On selection of an option, filter options of other filters
   * @param event The event fired when selecting an option from auto-complete
   */
  public async onSelection(event: MatAutocompleteSelectedEvent) {
    // extract selected option from event
    const selectedOption: Option = event.option.value;

    // for every type of filter...
    for (let typeOptions of this.filteredTypesOptions) {
      // ...if the selected option type is not equal to the filter type
      if (selectedOption.type !== typeOptions.type && typeOptions.options) {
        // extract types and code
        const sourceType: string = selectedOption.type;
        const sourceCode: string = selectedOption.code;
        const targetType: string = typeOptions.type;

        // get options from terrAPI
        const featureCollection = await this.getOptionsFromTerrAPI(false, sourceType, sourceCode, targetType);

        // when options are returned...
        if (featureCollection) {
          let options: Array<Option> = [];

          // ...push new options in arrays and replace old options
          featureCollection.features.forEach(feature => {
            options.push({type: targetType, code: feature.properties.code, nom: feature.properties.nom});
          });

          typeOptions.options = options;
        }
      }
    }
    this.allTypesOptions = JSON.parse(JSON.stringify(this.filteredTypesOptions));
  }

  /**
   * @description Filter options as the user types characters in a field
   * @param currentFormGroupValue An object representing the current value of the form (and its controls)
   */
  private filterOptions(currentFormGroupValue: object) {
    // for every control in the from group...
    for (let control in currentFormGroupValue) {
      const currentControlValue: string = currentFormGroupValue[control];
      const previousControlValue: string = this.previousFiltersFormGroupValue[control];
      // ...if the current value of the control is not the same as the previous value of the control...
      if (currentControlValue !== previousControlValue && typeof currentControlValue === 'string') {
        // ...filter the options and make the previous form group value the current form group value
        const options: Array<Option> = this.allTypesOptions.find((typeOptions: TypeOptions) =>
          typeOptions.type === control
        ).options;
        if (options) {
          const filteredOptions: Array<Option> = options.filter((option: Option) =>
            option.nom.toLowerCase().includes(currentControlValue.toLowerCase())
          );
          this.filteredTypesOptions.find((typeOptions: TypeOptions) => typeOptions.type === control).options = filteredOptions;
        }
      }
    }
    this.previousFiltersFormGroupValue = currentFormGroupValue;
  }

  /**
   * @description Check if (a) value(s) is present in (a) field(s) to determine if buttons should be disabled
   * @returns A boolean representing if a button should be disabled or not
   */
  public areButtonsDisabled(): boolean {
    const formGroupValue: object = this.filtersFormGroup.value;
    let disabled: boolean = true;

    for (let control in formGroupValue) {
      if (typeof formGroupValue[control] === 'object' && formGroupValue[control] !== null) {
        disabled = false;
        break;
      }
    }

    return disabled;
  }

  public onFilter() {
    console.log(this.filtersFormGroup.value);
  }

  /**
   * @description Reset/empty every field and reset the options
   */
  public async onResetFilters() {
    // reset the controls
    this.filtersFormGroup.reset();

    // reset all of the options for every filter
    for (let filter of this.simpleFiltersConfig.filters) {
      if (filter.type) {
        // ...get the options from terrAPI and replace them in the array containing all the options
        await this.getOptionsOfFilter(filter).then((typeOptions: TypeOptions) => {
          this.allTypesOptions.find((typeOptions: TypeOptions) => typeOptions.type === filter.type).options = typeOptions.options;
        });
      }
    }

    // deep-copy the array containing all the options
    this.filteredTypesOptions = JSON.parse(JSON.stringify(this.allTypesOptions));
  }
}
