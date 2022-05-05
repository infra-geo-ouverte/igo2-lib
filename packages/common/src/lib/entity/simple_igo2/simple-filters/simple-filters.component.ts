import { FeatureCollection } from 'geojson';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SimpleFilter, TypeValues, Value } from './simple-filters.interface';
import { ConfigService } from '@igo2/core';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'igo-simple-filters',
  templateUrl: './simple-filters.component.html',
  styleUrls: ['./simple-filters.component.scss']
})
export class SimpleFiltersComponent implements OnInit, OnDestroy {
  public terrAPIBaseURL: string = "https://geoegl.msp.gouv.qc.ca/apis/terrapi/";
  public filtersConfig: Array<SimpleFilter>;
  public typesValues: Array<TypeValues> = [];
  public filteredTypesValues$: Observable<Array<TypeValues>>;
  public typesValuesChange$$: Subscription;
  public previousSpatialFiltersFormValue: any;

  public spatialFiltersForm: FormGroup;

  constructor(private configService: ConfigService, private http: HttpClient, private formBuilder: FormBuilder) { }

  async ngOnInit(): Promise<void> {
    this.filtersConfig = this.configService.getConfig('simpleFilters');

    this.spatialFiltersForm = this.formBuilder.group({});

    for (let filter of this.filtersConfig) {
      if (filter.type) {
        const typeValues: TypeValues = await this.getValues(filter);

        if (typeValues) {
          this.typesValues.push(typeValues);
        }
      }
    }

    this.typesValues.forEach((typeValues: TypeValues) => {
      this.spatialFiltersForm.addControl(typeValues.type, this.formBuilder.control(''));
    });

    this.spatialFiltersForm.valueChanges.subscribe(currentSpatialFiltersFormValue => {
      console.log(currentSpatialFiltersFormValue)
      const values: Array<Value> = [];
      for (let type in currentSpatialFiltersFormValue) {
        if (currentSpatialFiltersFormValue[type] instanceof Object) {
          values.push(currentSpatialFiltersFormValue[type]);
        }
      }

      if (values.length > 0) {
        for (let typeValues of this.typesValues) {
          for (let value of values) {
            if (typeValues.type !== value.type) {
              const sourceType: string = value.type;
              const sourceCode: string = value.code;
              const targetType: string = typeValues.type;

              const url: string = this.terrAPIBaseURL + `${sourceType}/${sourceCode}/${targetType}`;
              const params: HttpParams = new HttpParams().set('sort', 'nom');

              this.http.get<FeatureCollection>(url, {params}).pipe(map((featureCollection: FeatureCollection) => {
                console.log(featureCollection)
              }))
            }
          }
        }
      }
    });
  }


  ngOnDestroy() {
    this.typesValuesChange$$.unsubscribe();
  }

  filter(value) {
    const filterValue = value.toLowerCase();
    console.log(value)
    return this.typesValues
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

  getDescription(formControlName: string): string {
    const typeValuesFiltered: TypeValues = this.typesValues.find((typeValues: TypeValues) => typeValues.type === formControlName);
    return typeValuesFiltered.description;
  }

  getOptions(formControlName: string): Array<Value> {
    return this.typesValues.find(typeValues => typeValues.type === formControlName).values;
  }

  onFilter() {
    console.log('filter');
  }

  onResetFilters() {
    console.log('reset filters');
  }
}
