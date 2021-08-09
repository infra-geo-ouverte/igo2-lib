import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IgoMap } from '../shared/map';
import { Subscription } from 'rxjs';

/**
 * Tool to display the center of the map
 */
@Component({
  selector: 'igo-map-center',
  templateUrl: './map-center.component.html',
  styleUrls: ['./map-center.component.scss']
})

export class MapCenterComponent implements AfterViewInit, OnDestroy {

  /**
   * Get an active map
   */
  @Input() map: IgoMap;
  // @Input()
  // get map(): IgoMap {
  //   return this._map;
  // }

  // /**
  //  * The map to swipe on
  //  */
  // private _map: IgoMap;


  /**
   * Listener of toggle from advanced-map-tool
   */
  private displayCenter$$: Subscription;
  constructor() {}

  /**
   * Set a visibility for cursor of the center of the map
   */
   ngAfterViewInit() {
    this.displayCenter$$ = this.map.mapCenter$.subscribe(value => {
      value ?
      document.getElementById('mapCenter').style.visibility = 'visible' :
      document.getElementById('mapCenter').style.visibility = 'hidden';
    });
  }

  /**
   * Destroyer of a component
   */
  ngOnDestroy(){
    this.displayCenter$$.unsubscribe();
  }
}
