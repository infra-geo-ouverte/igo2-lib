import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()

export class InteractiveTourLoader {
  private jsonURL = 'locale/interactiveTour_configOptions.json';
  private allToursOptions;

  constructor(
    private http: HttpClient
  ) {
    this.getJSON().subscribe(data => {
      console.log('in loader subscribe');
      this.allToursOptions = data;
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.jsonURL);
  }

  public getTourOptionData(toolName) {
    if (this.allToursOptions === undefined) {
      return undefined;
    }
    let nameInConfigFile = 'introOptions_' + toolName;
    nameInConfigFile = nameInConfigFile.replace(/\s/g, '');
    return this.allToursOptions[nameInConfigFile];
  }

}
