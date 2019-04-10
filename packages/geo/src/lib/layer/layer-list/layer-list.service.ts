import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayerListService {
  public keyword: string;
  public sortedAlpha = false;
  public onlyVisible = false;
  public onlyInRange = false;
  public keywordInitialized = false;
  public sortedAlphaInitialized = false;
  public onlyVisibleInitialized = false;
  public onlyInRangeInitialized = false;

  constructor() {}

}
