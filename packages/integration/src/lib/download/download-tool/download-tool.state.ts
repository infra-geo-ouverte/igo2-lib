import { Injectable } from '@angular/core';
import { TileToDownload } from '@igo2/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
 })
export class DownloadToolState {
  selectedTabIndex: number = 0;

  constructor() {}

}
