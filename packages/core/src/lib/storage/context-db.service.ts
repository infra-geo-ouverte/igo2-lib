import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DbData } from './dbData';

@Injectable({
  providedIn: 'root'
})
export class ContextDBService {

  constructor(
    private dbService: NgxIndexedDBService
  ) { }

  public get(url: string): Observable<Object> {
    return this.dbService.getByKey('contexts', url).pipe(
      map((data) => {
        return (data as DbData).object;
      })
    );
  }
}
