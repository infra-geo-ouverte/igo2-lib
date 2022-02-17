import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { EntityStore, EntityTableComponent, EntityTableTemplate, ToolComponent } from '@igo2/common';
import { LanguageService, MessageService } from '@igo2/core';
import { Feature, IgoMap, roundCoordTo } from '@igo2/geo';
import { Clipboard } from '@igo2/utils';
import * as olProj from 'ol/proj';
import { Subscription } from 'rxjs';
import { MapProximityState } from '../map-proximity.state';
import { MapRtssProximityState } from '../map-rtss-proximity.state';
import { MapState } from '../map.state';
import { NumberUtils } from '@igo2/utils';
@ToolComponent({
  name: 'map-rtss-proximity',
  title: 'igo.integration.tools.closestFeature',
  icon: 'axis-arrow-info'
})

/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-map-rtss-proximity-tool',
  templateUrl: './map-rtss-proximity-tool.component.html',
  styleUrls: ['./map-rtss-proximity-tool.component.scss']
})

export class MapRtssProximityToolComponent implements OnInit, OnDestroy {

  private subs$$: Subscription[] = [];
  @ViewChild('table', { static: true }) table: EntityTableComponent;

  get maxDistance() {
    return this.mapProximityState.proximityRadiusValue$.value;
  }
  set maxDistance(value: number) {
    this.mapProximityState.proximityRadiusValue$.next(value);
  }

  public proximityRtssEntityStore: EntityStore<{}> = new EntityStore<Feature>([]);

  get map(): IgoMap {
    return this.mapState.map;
  }
  public userDefinedMapCenter: boolean;
  public userDefinedFollowPosition: boolean;
  public currentPositionCoordinate: [number, number] = [undefined, undefined];
  /**
   * Table template
   * @internal
   */
  public tableTemplate: EntityTableTemplate = {
    selection: false,
    selectMany: false,
    selectionCheckbox: false,
    sort: false,
    columns: [
      {
        name: 'title',
        title: 'Titre', // this.languageService.translate.instant('igo.geo.measure.lengthHeader'),
        valueAccessor: (item: any) => item.title
      },
      {
        name: 'value',
        title: 'Valeur', // this.languageService.translate.instant('igo.geo.measure.areaHeader'),
        valueAccessor: (item: any) => item.value
      }
    ]
  };

  constructor(
    public mapState: MapState,
    public mapProximityState: MapProximityState,
    public mapRtssProximityState: MapRtssProximityState,
    private languageService: LanguageService,
    private messageService: MessageService) {
  }

  ngOnInit(): void {

    this.userDefinedFollowPosition = this.map.geolocationController.followPosition === true;
    this.userDefinedMapCenter = this.map.mapCenter$.value === true;

    this.subs$$.push(this.mapProximityState.proximitylocationType$.subscribe(v => {
      this.map.mapCenter$.next(v !== 'geolocation');
      if (v === 'geolocation') {
        if (this.map.geolocationController.followPosition !== this.userDefinedFollowPosition) {
          this.map.geolocationController.followPosition = this.userDefinedFollowPosition;
        }
      } else {
        this.map.geolocationController.followPosition = false;
      }
    }));

    this.mapRtssProximityState.currentRTSSCh$.subscribe(rtss => {
      let position;
      let precision = "ND";
      if (this.mapProximityState.proximitylocationType$?.value === 'geolocation') {
        position = this.map.geolocationController.position$.value;
      }


      if (position) {
        const coordLonLat = olProj.transform(position.position, this.map.projection, 'EPSG:4269');
        this.currentPositionCoordinate = roundCoordTo(coordLonLat as [number, number], 6);
        precision = NumberUtils.roundToNDecimal(position.accuracy,1).toString();
      } else {
        const coordLonLat = this.map.viewController.getCenter('EPSG:4269');
        this.currentPositionCoordinate = roundCoordTo(coordLonLat as [number, number], 6);
      }

      const proximityFeatures = this.mapProximityState.proximityFeatureStore.all();
      const proximityMunFeature = proximityFeatures.find(f => f.properties.layerSrcId === 'mun');
      const proximityCsFeature = proximityFeatures.find(f => f.properties.layerSrcId === 'cs');
      let x = this.currentPositionCoordinate[0] || '';
      let y = this.currentPositionCoordinate[1] || '';
      let route = "";
      let tronc = "";
      let sect = "";
      let srte = "";
      let chain = "";
      let dist = "";
      let mun = proximityMunFeature ? proximityMunFeature.properties.MUS_NM_MUN : '';
      let cs = proximityCsFeature ? proximityCsFeature.properties.nom_unite_ : '';

      if (!rtss) {
        this.proximityRtssEntityStore.clear();
      } else {
        route = rtss.properties?.num_route ? rtss.properties.num_route : '';
        tronc = rtss.properties?.num_tronc ? rtss.properties.num_tronc : '';
        sect = rtss.properties?.num_sectn ? rtss.properties.num_sectn : '';
        srte = rtss.properties?.num_rts ? rtss.properties.num_rts.substring(rtss.properties.num_rts.length - 4) : '';
        chain = rtss.properties?.chainage ? rtss.properties.chainage : '';
        dist = rtss.properties?.distance ? rtss.properties.distance : '';

      }


      const rtssInfo = [
        { id: 1, title: 'X', value: x },
        { id: 2, title: 'Y', value: y },
        { id: 3, title: 'Précision', value: precision },
        { id: 4, title: 'Route', value: route },
        { id: 5, title: 'Tronçon', value: tronc },
        { id: 6, title: 'Section', value: sect },
        { id: 7, title: 'Srte', value: srte },
        { id: 8, title: 'Chainage', value: chain },
        { id: 9, title: 'Distance', value: dist },
        { id: 10, title: 'Muni', value: mun },
        { id: 11, title: 'CS', value: cs },
      ];
      this.proximityRtssEntityStore.updateMany(rtssInfo);
    });
  }

  ngOnDestroy(): void {
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

    const successful = Clipboard.copy(this.currentPositionCoordinate.toString());
    if (successful) {
      const translate = this.languageService.translate;
      const title = translate.instant(
        'igo.integration.advanced-map-tool.advanced-coordinates.copyTitle'
      );
      const msg = translate.instant('igo.integration.advanced-map-tool.advanced-coordinates.copyMsg');
      this.messageService.success(msg, title);
    }
  }
}
