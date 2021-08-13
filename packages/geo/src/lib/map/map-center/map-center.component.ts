import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IgoMap } from '../shared/map';
import { Subscription } from 'rxjs';
// import { MapState } from '@igo2/integration';

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
  // public mapState: MapState;
  constructor() {}

  /**
   * Set a visibility for cursor of the center of the map
   */
   ngAfterViewInit() {
    if (this.map) {
      this.displayCenter$$ = this.map.mapCenter$.subscribe(value => {
        value ?
        document.getElementById('mapCenter').style.visibility = 'visible' :
        document.getElementById('mapCenter').style.visibility = 'hidden';
      });
    }
    this.letZoom();
  }


  /**
   * Destroyer of a component
   */
  ngOnDestroy(){
    if (this.displayCenter$$) {
      this.displayCenter$$.unsubscribe();
    }
  }

  go(event) {
    console.log(event);
  }

  private letZoom() {
    document.getElementById('mapCenter').addEventListener('scroll', event => {
      console.log('1111111111111');
    }, true);
  }
}
