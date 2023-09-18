import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayerListToolService {
  public keyword: string;
  public sortAlpha = false;
  public onlyVisible = false;
  public onlyInRange = false;
  public keywordInitialized = false;
  public sortedAlphaInitialized = false;
  public onlyVisibleInitialized = false;
  public onlyInRangeInitialized = false;

  constructor() {}
}
