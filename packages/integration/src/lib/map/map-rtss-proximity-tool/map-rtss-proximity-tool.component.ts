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
import { MatButtonToggleChange } from '@angular/material/button-toggle';
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
  public rtssForCopyPaste: string = '';

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
    headerClassFunc: () => {return { 'class_display_none': true };},
    columns: [
      {
        name: 'title',
        title: '', // this.languageService.translate.instant('igo.geo.measure.lengthHeader'),
        valueAccessor: (item: any) => item.title
        ,
        cellClassFunc: () => {
          return { 'titleRtssInfo': true };
        }
      },
      {
        name: 'value',
        title: '', // this.languageService.translate.instant('igo.geo.measure.areaHeader'),
        valueAccessor: (item: any) => item.value
        ,
        cellClassFunc: () => {
          return { 'valueRtssInfo': true };
        }
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

  onRtssFilterChange(e: MatButtonToggleChange) {
    this.mapRtssProximityState.activeRtssFilter$.next(e.value);
  }

  ngOnInit(): void {
    this.map.ol.once('rendercomplete', () => {
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

    this.mapRtssProximityState.currentRTSSCh$.subscribe(rtss => {
      let position;
      let precision = "ND";
      if (this.mapProximityState.proximitylocationType$?.value === 'geolocation') {
        position = this.map.geolocationController.position$.value;
      }


      if (position) {
        if (!position.position && !position.accuracy) {
          return;
        }
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
      let tr_sect = "";
      let srte = "";
      let chain = "";
      let dist = "";
      let mun = proximityMunFeature ? proximityMunFeature.properties.MUS_NM_MUN : '';
      let cs = proximityCsFeature ? proximityCsFeature.properties.nom_unite : '';
      this.rtssForCopyPaste = undefined;

      if (!rtss) {
        this.proximityRtssEntityStore.clear();
      } else {
        route = rtss.properties?.num_route ? rtss.properties.num_route : '';
        tronc = rtss.properties?.num_tronc ? rtss.properties.num_tronc : '';
        sect = rtss.properties?.num_sectn ? rtss.properties.num_sectn : '';
        tr_sect = `${tronc}-${sect}`;
        srte = rtss.properties?.num_rts ? rtss.properties.num_rts.substring(rtss.properties.num_rts.length - 4) : '';
        chain = rtss.properties?.chainage >= 0 ? rtss.properties.chainage : '';
        dist = rtss.properties?.distance ? rtss.properties.distance : '';

        if (typeof chain === 'number') {
          chain = `${Math.floor(chain/1000)}+${String(chain%1000).padStart(3, '0')}`;
        }

        this.rtssForCopyPaste =
`RTSS: ${route}-${tronc}-${sect}-${srte}
Chaînage: ${chain}
Distance entre la position GPS et le RTSS-Ch: ${rtss.properties.distance} m
Latitude: ${y}
Longitude: ${x}
Précision GPS: ${precision} m
Municipalité: ${mun}
Centre de services: ${cs}`;
      }

      const rtssInfo = [
        { id: 4, title: 'Rte', value: route },
        { id: 5, title: 'Tr-Se', value: tr_sect },
        { id: 6, title: 'Srte', value: srte },
        { id: 8, title: 'Chn', value: chain },
        { id: 9, title: 'Dist', value: dist },
        { id: 10, title: 'GPS(m)', value: precision }

      ];
      this.proximityRtssEntityStore.updateMany(rtssInfo);
    });
  });
  }

  ngOnDestroy(): void {
    this.map.mapCenter$.next(this.userDefinedMapCenter);
    this.subs$$.map(s => s.unsubscribe());
    this.map.geolocationController.followPosition = this.userDefinedFollowPosition;
  }

  onLocationTypeChange(e: MatRadioChange | MatButtonToggleChange ) {
    this.mapProximityState.proximitylocationType$.next(e.value);
  }

  /**
   * Copy the coordinates to a clipboard
   */
  copyTextToClipboard(): void {

    const successful = Clipboard.copy(this.rtssForCopyPaste);
    if (successful) {
      const translate = this.languageService.translate;
      const title = translate.instant(
        'Info RTSS'
      );
      const msg = `L'information de votre position réseau a été copiée dans le presse-papier.`;
      this.messageService.success(msg, title,{timeOut: 5000});
    }
  }
}
