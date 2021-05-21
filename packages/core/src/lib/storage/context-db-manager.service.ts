import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})
export class ContextDBManagerService {

  constructor(
    private dbService: NgxIndexedDBService,
    private http: HttpClient
  ) { }

  update(url:string, options?) {
    if (window.navigator.onLine) {
      this.http.get(url, options).subscribe((response) => {
        this.dbService.update('contexts', { url: url, object: response})
      });
    }
  }
}
