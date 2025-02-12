import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { IgoMap } from '../shared/map';

/**
 * Tool to display the center of the map
 */
@Component({
  selector: 'igo-map-center',
  templateUrl: './map-center.component.html',
  styleUrls: ['./map-center.component.scss'],
  standalone: true
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

  /**
   * Set a visibility for cursor of the center of the map
   */
  ngAfterViewInit() {
    if (this.map) {
      this.displayCenter$$ = this.map.mapCenter$.subscribe((value) => {
        document.getElementById('mapCenter').style.visibility = value
          ? 'visible'
          : 'hidden';
      });
    }
    this.letZoom();
  }

  /**
   * Destroyer of a component
   */
  ngOnDestroy() {
    if (this.displayCenter$$) {
      this.displayCenter$$.unsubscribe();
    }
  }

  /**
   * Zoom on div
   */
  private letZoom() {
    document.getElementById('mapCenter').addEventListener(
      'wheel',
      (event) => {
        event.deltaY > 0
          ? this.map.viewController.zoomOut()
          : this.map.viewController.zoomIn();
      },
      true
    );
  }
}
