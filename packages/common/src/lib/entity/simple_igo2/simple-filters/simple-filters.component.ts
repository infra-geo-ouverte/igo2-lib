import { FeatureCollection } from 'geojson';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SimpleFilter } from './simple-filters.interface';
import { ConfigService } from '@igo2/core';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'igo-simple-filters',
  templateUrl: './simple-filters.component.html',
  styleUrls: ['./simple-filters.component.scss']
})
export class SimpleFiltersComponent implements OnInit {
  public myControl = new FormControl();
  public terrapiBaseURL: string = "https://geoegl.msp.gouv.qc.ca/apis/terrapi/";
  public filters: Array<SimpleFilter>;
  public values: Array<string> = [];
  public filteredValues$: Observable<Array<string>>;

  constructor(private configService: ConfigService, private http: HttpClient) { }

  ngOnInit(): void {
    this.filters = this.configService.getConfig('simpleFilters');
    this.filteredValues$ = this.myControl.valueChanges.pipe(startWith(''), map(value => this.filter(value)));

    this.filters.forEach(filter => {
      if (filter.type) {
        this.createFilterList(filter.type).subscribe((featureCollection: FeatureCollection) => {
          featureCollection.features.forEach(feature => {
            this.values.push(feature.properties.nom);
          });
        });
      }
    });
  }

  filter(value: string): Array<string> {
    const filterValue = value.toLowerCase();
    return this.values.filter(option => option.toLocaleLowerCase().includes(filterValue));
  }

  createFilterList(type: string): Observable<FeatureCollection> {
    const url: string = this.terrapiBaseURL + type;
    const params = new HttpParams().set('sort', 'nom');
    return this.http.get<FeatureCollection>(url, {params}).pipe(map(featureCollection => {
      return featureCollection;
    }));
  }

  resetFilters() {
    console.log('reset filters');
  }
}
