import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { EntityTableComponent, EntityTableTemplate, ToolComponent } from '@igo2/common';
import { LanguageService, MessageService } from '@igo2/core';
import { Feature, IgoMap } from '@igo2/geo';
import { NumberUtils, Clipboard } from '@igo2/utils';
import { Subscription } from 'rxjs';
import { MapProximityState } from '../map-proximity.state';
import { MapState } from '../map.state';
@ToolComponent({
  name: 'map-proximity',
  title: 'igo.integration.tools.closestFeature',
  icon: 'radius'
})

/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-map-proximity-tool',
  templateUrl: './map-proximity-tool.component.html',
  styleUrls: ['./map-proximity-tool.component.scss']
})

export class MapProximityToolComponent implements OnInit, OnDestroy {

  private subs$$: Subscription[] = [];
  @ViewChild('table', { static: true }) table: EntityTableComponent;

  get maxDistance() {
    return this.mapProximityState.proximityRadiusValue$.value;
  }
  set maxDistance(value: number) {
    this.mapProximityState.proximityRadiusValue$.next(value);
  }

  get map(): IgoMap {
    return this.mapState.map;
  }
  public userDefinedMapCenter: boolean;
  public userDefinedFollowPosition: boolean;
  /**
   * Table template
   * @internal
   */
  public tableTemplate: EntityTableTemplate = {
    selection: true,
    selectMany: false,
    selectionCheckbox: false,
    sort: true,
    columns: [
      {
        name: 'element',
        title: this.languageService.translate.instant('igo.integration.map-proximity-tool.feature'),
        valueAccessor: (localFeature: Feature) => {
          return localFeature.properties.element;
        }
      },
      {
        name: 'distance',
        title: this.languageService.translate.instant('igo.integration.map-proximity-tool.distance'),
        valueAccessor: (localFeature: Feature) => {
          return `${NumberUtils.roundToNDecimal(localFeature.properties.distance, 1)}m`;
        }
      }
    ]
  };

  constructor(
    public mapState: MapState,
    public mapProximityState: MapProximityState,
    private languageService: LanguageService,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.mapProximityState.enabled$.next(true);
    this.userDefinedFollowPosition = this.map.geolocationController.followPosition === true;
    this.userDefinedMapCenter = this.map.mapCenter$.value === true;

    this.subs$$.push(this.mapProximityState.proximitylocationType$.subscribe(v => {
      this.map.mapCenter$.next(v !== 'geolocation');
      if (v === 'geolocation') {
        this.map.geolocationController.followPosition = true;
      } else {
        this.map.geolocationController.followPosition = false;
      }
    }));
  }

  ngOnDestroy(): void {
    this.mapProximityState.enabled$.next(false);
    this.map.mapCenter$.next(this.userDefinedMapCenter);
    this.subs$$.map(s => s.unsubscribe());
    this.map.geolocationController.followPosition = this.userDefinedFollowPosition;
  }

  onLocationTypeChange(e: MatRadioChange) {
    this.mapProximityState.proximitylocationType$.next(e.value);
  }

  /**
   * Copy the coordinates to a clipboard
   */
  copyTextToClipboard(): void {

    const successful = Clipboard.copy(this.mapProximityState.currentPositionCoordinate$?.value.toString());
    if (successful) {
      this.messageService.success('igo.integration.map-proximity-tool.copyMsg', 'igo.integration.map-proximity-tool.copyTitle');
    }
  }
}
