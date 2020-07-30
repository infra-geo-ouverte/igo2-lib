import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { InteractiveTourOptions } from './interactive-tour.interface';
import { ConfigService } from '@igo2/core';

@Injectable()
export class InteractiveTourLoader {
  private jsonURL: string;
  private allToursOptions;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.jsonURL = this.getPathToConfigFile();
    this.allToursOptions = this.getJSON().subscribe((data) => {
      this.allToursOptions = data;
    });
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
