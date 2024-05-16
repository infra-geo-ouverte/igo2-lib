import { AsyncPipe, NgIf } from '@angular/common';
import { AfterContentInit, Component, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-geolocate-button',
  templateUrl: './geolocate-button.component.html',
  styleUrls: ['./geolocate-button.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class GeolocateButtonComponent implements AfterContentInit, OnDestroy {
  private tracking$$: Subscription;
  readonly icon$: BehaviorSubject<string> = new BehaviorSubject('my_location');

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

  constructor(private configService: ConfigService) {}
  ngAfterContentInit(): void {
    this.map.ol.once('rendercomplete', () => {
      this.tracking$$ = this.map.geolocationController.tracking$.subscribe(
        (tracking) => {
          if (tracking) {
            this.icon$.next('my_location');
          } else {
            this.configService.getConfig('geolocate.basic')
              ? this.icon$.next('my_location')
              : this.icon$.next('location_searching');
          }
        }
      );
    });
  }

  ngOnDestroy(): void {
    if (this.tracking$$) {
      this.tracking$$.unsubscribe();
    }
  }

  onGeolocationClick() {
    const tracking = this.map.geolocationController.tracking;
    this.map.geolocationController.tracking = tracking ? false : true;
  }
}
