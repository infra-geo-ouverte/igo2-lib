import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { InteractiveTourOptions } from './interactive-tour.interface';

@Injectable()

export class InteractiveTourLoader {
  private jsonURL = 'locale/interactiveTour_configOptions.json';
  private allToursOptions;

  constructor(
    private http: HttpClient
  ) {
    this.getJSON();
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.jsonURL)
      .pipe(
        catchError(e => {
          e.error.caught = true;
          throw e;
        })
      )
  }

  public getTourOptionData(toolName): InteractiveTourOptions {
    if (this.allToursOptions === undefined) {
      return undefined;
    }
    let nameInConfigFile = 'introOptions_' + toolName;
    nameInConfigFile = nameInConfigFile.replace(/\s/g, '');
    return this.allToursOptions[nameInConfigFile];
  }

}
