import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
 })
export class DownloadToolState {
  selectedTabIndex: number = 0;

  constructor() {}

}
