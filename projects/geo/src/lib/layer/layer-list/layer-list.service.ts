import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayerListService {
  public keyword: string;
  public sortedAlpha = false;
  public onlyVisible = false;
  public onlyInRange = false;
  public keywordInitializated = false;
  public sortedAlphaInitializated = false;
  public onlyVisibleInitializated = false;
  public onlyInRangeInitializated = false;

  constructor() {}


  getKeyword() {
    return this.keyword;
  }

}
