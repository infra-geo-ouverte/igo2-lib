import { FeatureCollection } from 'geojson';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SimpleFilter, TypeValues, Value } from './simple-filters.interface';
import { ConfigService } from '@igo2/core';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'igo-simple-filters',
  templateUrl: './simple-filters.component.html',
  styleUrls: ['./simple-filters.component.scss']
})
export class SimpleFiltersComponent implements OnInit {
  public terrAPIBaseURL: string = "https://geoegl.msp.gouv.qc.ca/apis/terrapi/";
  public filtersConfig: Array<SimpleFilter>;
  public allTypesValues: Array<TypeValues> = [];
  public filteredTypesValues: Array<TypeValues> = [];

  public spatialFiltersForm: FormGroup;
  public spatialFiltersFormPreviousValues: any;

  constructor(private configService: ConfigService, private http: HttpClient, private formBuilder: FormBuilder) { }

  async ngOnInit(): Promise<void> {
    this.filtersConfig = this.configService.getConfig('simpleFilters');

    this.spatialFiltersForm = this.formBuilder.group({});

    for (let filter of this.filtersConfig) {
      if (filter.type) {
        const typeValues: TypeValues = await this.getValues(filter);

        if (typeValues) {
          this.allTypesValues.push(typeValues);
        }
      }
    }
    this.filteredTypesValues = JSON.parse(JSON.stringify(this.allTypesValues));

    this.allTypesValues.forEach((typeValues: TypeValues) => {
      this.spatialFiltersForm.addControl(typeValues.type, this.formBuilder.control(''));
    });

    this.spatialFiltersFormPreviousValues = this.spatialFiltersForm.value;

    this.spatialFiltersForm.valueChanges.subscribe(spatialFiltersFormCurrentValues => {
      this.filterValues(spatialFiltersFormCurrentValues);
    });
  }

  displayName(value: Value) {
    return value?.nom ? value.nom : '';
  }

  async getValues(filter: SimpleFilter): Promise<TypeValues> {
    const featureCollection: FeatureCollection = await this.createFilterList(filter.type);

    if (featureCollection) {
      let values: Array<Value> = [];
      featureCollection.features.forEach(feature => {
        values.push({type: filter.type, code: feature.properties.code, nom: feature.properties.nom});
      });
      const typeValues: TypeValues = {type: filter.type, description: filter.description, values: values};

      return typeValues;
    };
  }

  async createFilterList(type: string): Promise<FeatureCollection> {
    const url: string = this.terrAPIBaseURL + type;
    const params: HttpParams = new HttpParams().set('sort', 'nom');
    let response: FeatureCollection;

    await this.http.get<FeatureCollection>(url, {params}).pipe(map((featureCollection: FeatureCollection) => {
      response = featureCollection;
      return featureCollection;
    })).toPromise();

    return response;
  }

  async createFilterList2(sourceType: string, sourceCode: string, targetType: string): Promise<FeatureCollection> {
    const url: string = this.terrAPIBaseURL + `${sourceType}/${sourceCode}/${targetType}`;
    const params: HttpParams = new HttpParams().set('sort', 'nom');
    let response: FeatureCollection;

    await this.http.get<FeatureCollection>(url, {params}).pipe(map((featureCollection: FeatureCollection) => {
      response = featureCollection;
    })).toPromise();

    return response;
  }

  getDescription(formControlName: string): string {
    const typeValuesFiltered: TypeValues = this.filteredTypesValues.find((typeValues: TypeValues) => typeValues.type === formControlName);
    return typeValuesFiltered.description;
  }

  getOptions(formControlName: string): Array<Value> {
    return this.filteredTypesValues.find(typeValues => typeValues.type === formControlName).values;
  }

  async onSelection(event: MatAutocompleteSelectedEvent) {
    const value: Value = event.option.value;
    for (let typeValues of this.filteredTypesValues) {
      if (value.type !== typeValues.type) {
        const sourceType: string = value.type;
        const sourceCode: string = value.code;
        const targetType: string = typeValues.type;

        const featureCollection = await this.createFilterList2(sourceType, sourceCode, targetType);

        if (featureCollection) {
          let values: Array<Value> = [];

          featureCollection.features.forEach(feature => {
            values.push({type: targetType, code: feature.properties.code, nom: feature.properties.nom});
          });

          typeValues.values = values;
        }
      }
    }
  }

  filterValues(currentFormGroupValues: any) {
    for (let control in currentFormGroupValues) {
      const currentValue: string = currentFormGroupValues[control];
      const previousValue: string = this.spatialFiltersFormPreviousValues[control];
      if (currentValue !== previousValue && typeof currentValue === 'string') {
        const allTypesValues: Array<TypeValues> = this.allTypesValues;
        const values: Array<Value> = allTypesValues.find((typeValues: TypeValues) => typeValues.type === control).values;
        const filteredValues: Array<Value> = values.filter((value: Value) => value.nom.toLowerCase().includes(currentValue.toLowerCase()));
        this.filteredTypesValues.find((typeValue: TypeValues) => typeValue.type === control).values = filteredValues;
      }
    }
    this.spatialFiltersFormPreviousValues = currentFormGroupValues;
  }

  onFilter() {
    console.log('filter');
  }

  onResetFilters() {
    console.log('reset filters');
  }
}
