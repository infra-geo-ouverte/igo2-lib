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

  /**
   * Zoom on div
   */
  private letZoom() {
    document.getElementById('mapCenter').addEventListener('wheel', event => {
      if (event.deltaY > 0) {
        this.map.viewController.zoomOut();
      }
      if (event.deltaY < 0) {
        this.map.viewController.zoomIn();
      }
    }, true);
  }
}
