import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InteractiveTourOptions } from './interactive-tour.interface';

@Injectable()
export class InteractiveTourLoader {
  private jsonURL: string;
  private allToursOptions;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.jsonURL = this.getPathToConfigFile();
  }

  public loadConfigTour() {
    this.getJSON().subscribe(
      (data) => {
        this.allToursOptions = data;
      },
      (err) => {
        throw new Error(
          `Problem with Interactive tour configuration file: interactiveTour.json not find. Check if the file and is path is set correctly.`
        );
      }
    );
  }

  public getPathToConfigFile(): string {
    return (
      this.configService.getConfig('interactiveTour.pathToConfigFile') ||
      './config/interactiveTour.json'
    );
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.jsonURL).pipe(
      catchError((e) => {
        e.error.caught = true;
        throw e;
      })
    );
  }

  public getTourOptionData(toolName): InteractiveTourOptions {
    if (this.allToursOptions === undefined) {
      return undefined;
    }
    let nameInConfigFile = toolName;
    nameInConfigFile = nameInConfigFile.replace(/\s/g, '');
    return this.allToursOptions[nameInConfigFile];
  }
}
