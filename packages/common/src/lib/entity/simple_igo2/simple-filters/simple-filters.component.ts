import { FeatureCollection } from 'geojson';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SimpleFilter, TypeValues, Values } from './simple-filters.interface';
import { ConfigService } from '@igo2/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'igo-simple-filters',
  templateUrl: './simple-filters.component.html',
  styleUrls: ['./simple-filters.component.scss']
})
export class SimpleFiltersComponent implements OnInit {
  public terrapiBaseURL: string = "https://geoegl.msp.gouv.qc.ca/apis/terrapi/";
  public filtersConfig: Array<SimpleFilter>;
  public typesValues: Array<TypeValues> = [];
  public values: Array<string> = [];
  public filteredValues$: Observable<Array<string>>;

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

    console.log(this.spatialFiltersForm);
  }

  filter(value: string): Array<string> {
    const filterValue = value.toLowerCase();
    return this.values.filter(option => option.toLocaleLowerCase().includes(filterValue));
  }

  async getValues(filter: SimpleFilter): Promise<TypeValues> {
    const featureCollection: FeatureCollection = await this.createFilterList(filter.type);

    if (featureCollection) {
      let values: Array<Values> = [];
      featureCollection.features.forEach(feature => {
        values.push({code: feature.properties.code, nom: feature.properties.nom});
      });
      const typeValues: TypeValues = {type: filter.type, description: filter.description, values: values};

      return typeValues;
    };
  }

  async createFilterList(type: string): Promise<FeatureCollection> {
    const url: string = this.terrapiBaseURL + type;
    const params = new HttpParams().set('sort', 'nom');
    let response: FeatureCollection;

    await this.http.get<FeatureCollection>(url, {params}).pipe(map((featureCollection: FeatureCollection) => {
      response = featureCollection;
      return featureCollection;
    })).toPromise();

    return response;
  }

  resetFilters() {
    console.log('reset filters');
  }
}
