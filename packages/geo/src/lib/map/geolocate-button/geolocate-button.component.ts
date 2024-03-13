import { AfterContentInit, Component, Input, OnDestroy } from '@angular/core';

import { ConfigService } from '@igo2/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-geolocate-button',
  templateUrl: './geolocate-button.component.html',
  styleUrls: ['./geolocate-button.component.scss']
})
export class GeolocateButtonComponent implements AfterContentInit, OnDestroy {
  private tracking$$: Subscription;
  private isTemporaryDisableFollowPositionToSwitch: boolean;
  readonly icon$: BehaviorSubject<string> = new BehaviorSubject(
    'crosshairs-gps'
  );

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color(): string {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  constructor(private configService: ConfigService) {
    this.isTemporaryDisableFollowPositionToSwitch = false;
  }
  ngAfterContentInit(): void {
    this.map.ol.once('rendercomplete', () => {
      this.tracking$$ = this.map.geolocationController.tracking$.subscribe(
        (tracking) => {
          if (tracking) {
            this.icon$.next('crosshairs-gps');
          } else {
            this.configService.getConfig('geolocate.basic')
              ? this.icon$.next('crosshairs-gps')
              : this.icon$.next('crosshairs');
          }
        }
      );
      this.map.geolocationController.temporaryDisableFollowPosition$.subscribe(
        (r) => {
          if (r) {
            this.color = 'accent';
          }
        }
      );
      this.map.geolocationController.followPosition$.subscribe((follow) => {
        if (follow) {
          this.color = 'primary';
        }
      });
      if (this.isTemporaryDisableFollowPositionToSwitch) {
        this.isTemporaryDisableFollowPositionToSwitch = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tracking$$) {
      this.tracking$$.unsubscribe();
    }
  }

  onGeolocationClick() {
    if (
      this.map.geolocationController.temporaryDisableFollowPosition &&
      this.map.geolocationController.tracking
    ) {
      this.isTemporaryDisableFollowPositionToSwitch = true;
      this.map.geolocationController.followPosition = true;
      this.map.geolocationController.tracking = false;
      this.map.geolocationController.temporaryDisableFollowPosition = undefined;

      this.color = 'primary';
    } else {
      this.isTemporaryDisableFollowPositionToSwitch = false;
    }
    const tracking = this.map.geolocationController.tracking;
    this.map.geolocationController.tracking = tracking ? false : true;
  }
}
