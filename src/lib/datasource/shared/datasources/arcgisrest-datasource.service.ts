import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { DataService } from './data.service';

@Injectable()
export class ArcGISRestDataSourceService extends DataService {
  constructor(private http: HttpClient) {
    super();
  }

  getData() {
    console.log('This is defining a datasource service.');
    return 'This is defining a datasource service.';
  }

  public getDataFromUrl(url: string) {
    return this.http.get(url);
  }
}
