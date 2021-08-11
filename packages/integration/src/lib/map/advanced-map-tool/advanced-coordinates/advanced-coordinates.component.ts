import { ChangeDetectorRef, Component, OnDestroy, OnInit, Input } from '@angular/core';
import { IgoMap, InputProjections, ProjectionsLimitationsOptions } from '@igo2/geo';
import { MapState } from '../../map.state';
import { Clipboard } from '@igo2/utils';
import { MessageService, LanguageService, StorageService, StorageScope, ConfigService } from '@igo2/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

/**
 * Tool to display the coordinates and a cursor of the center of the map
 */
@Component({
  selector: 'igo-advanced-coordinates',
  templateUrl: './advanced-coordinates.component.html',
  styleUrls: ['./advanced-coordinates.component.scss']
})
export class AdvancedCoordinatesComponent implements OnInit, OnDestroy {
  public projections$: BehaviorSubject<InputProjections[]> = new BehaviorSubject([]);
  public form: FormGroup;
  public coordinates: string[];
  private currentCenterDefaultProj: [number, number];
  public center: boolean = this.storageService.get('centerToggle') as boolean;
  private mapState$$: Subscription;
  private _projectionsLimitations: ProjectionsLimitationsOptions = {};
  private projectionsConstraints: ProjectionsLimitationsOptions;
  private zoneMtm$: BehaviorSubject<number> = new BehaviorSubject(0);
  private zoneUtm$: BehaviorSubject<number> = new BehaviorSubject(0);
  private defaultProj: InputProjections = {
    translatedValue: this.languageService.translate.instant('igo.geo.importExportForm.projections.wgs84', { code: 'EPSG:4326' }),
    translateKey: 'wgs84', alias: 'WGS84', code: 'EPSG:4326', zone: ''
  };
  private currentZones = { utm: undefined, mtm: undefined };
  public units: boolean = true;
  get map(): IgoMap {
    return this.mapState.map;
  }

  get inputProj(): InputProjections {
    return this.form.get('inputProj').value;
  }
  set inputProj(value: InputProjections) {
    this.form.patchValue({ inputProj: value });
  }
  get projectionsLimitations(): ProjectionsLimitationsOptions {
    return this._projectionsLimitations || {};
  }

  @Input()
  set projectionsLimitations(value: ProjectionsLimitationsOptions) {
    this._projectionsLimitations = value;
  }

  constructor(
    public mapState: MapState,
    private languageService: LanguageService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService,
    private config: ConfigService,
    private formBuilder: FormBuilder) {
      this.computeProjections();
      this.buildForm();
    }

  ngOnInit(): void {
    this.inputProj = this.defaultProj;
    this.map.mapCenter$.next(this.center);
    // todo pel ne semble pas fonctionner
    /*this.form.get('inputProj').setValue(this.defaultProj);
    this.form.patchValue({ inputProj: this.defaultProj });
    this.cdRef.detectChanges();*/
    this.coordinates = this.getCoordinates();
    this.currentCenterDefaultProj = this.map.viewController.getCenter(this.defaultProj.code);
    this.currentZones.mtm = this.zoneMtm(this.currentCenterDefaultProj[0]);
    this.currentZones.utm = this.zoneUtm(this.currentCenterDefaultProj[0]);

    this.mapState$$ =
      combineLatest([this.form.valueChanges, this.map.viewController.state$.pipe(debounceTime(50))])
        .subscribe(() => {
          this.currentCenterDefaultProj = this.map.viewController.getCenter(this.defaultProj.code);
          const currentMtmZone = this.zoneMtm(this.currentCenterDefaultProj[0]);
          const currentUtmZone = this.zoneUtm(this.currentCenterDefaultProj[0]);

          let zoneChange = false;
          if (currentMtmZone !== this.currentZones.mtm) {
            this.currentZones.mtm = currentMtmZone;
            zoneChange = true;
          }
          if (currentUtmZone !== this.currentZones.utm) {
            this.currentZones.utm = currentUtmZone;
            zoneChange = true;
          }
          if (zoneChange) {
            this.updateProjectionsZoneChange();
          }
          this.coordinates = this.getCoordinates();
          this.cdRef.detectChanges();
        });
    this.checkTogglePosition();
  }

  ngOnDestroy(): void {
    this.mapState$$.unsubscribe();
  }

  /**
   * Longitude and latitude of the center of the map
   */
  getCoordinates(): string[] {
    this.currentZones.mtm = this.zoneMtm(this.currentCenterDefaultProj[0]);
    this.currentZones.utm = this.zoneUtm(this.currentCenterDefaultProj[0]);
    let coord;
    const code = this.inputProj.code;
    let decimal = 2;
    if (code.includes('EPSG:4326') || code.includes('EPSG:4269')) {
      decimal = 5;
    }
    this.units = (code === 'EPSG:4326' || code === 'EPSG:4269');
    coord = this.map.viewController.getCenter(code).map(c => c.toFixed(decimal));

    return coord;
  }

  /**
   * Copy the coordinates to a clipboard
   */
  copyTextToClipboard() {
    const successful = Clipboard.copy(this.coordinates.toString());
    if (successful) {
      const translate = this.languageService.translate;
      const title = translate.instant(
        'igo.integration.advanced-map-tool.advanced-coordinates.copyTitle'
      );
      const msg = translate.instant('igo.integration.advanced-map-tool.advanced-coordinates.copyMsg');
      this.messageService.success(msg, title);
    }
  }

  /**
   * Display a cursor on the center of the map
   */
  displayCenter(toggle: boolean) {
    this.center = toggle;
    // this.mapState.mapCenter$.next(toggle);
    this.map.mapCenter$.next(toggle);
    this.storageService.set('centerToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Set the toggle position in a current value
   */
  checkTogglePosition() {
    if (this.storageService.get('centerToggle') === true) {
      this.center = true;
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      inputProj: ['', [Validators.required]]
    });
  }

  // todo pel déplacer dans un fichier.util dans geo.. permettant de gérer les zones utm mtm et réutiliser dans import et ici.
  private computeProjectionsConstraints() {
    const utmZone = this.projectionsLimitations.utmZone;
    const mtmZone = this.projectionsLimitations.mtmZone;
    this.projectionsConstraints = {
      projFromConfig: this.projectionsLimitations.projFromConfig === false ? false : true,
      nad83: this.projectionsLimitations.nad83 === false ? false : true,
      wgs84: this.projectionsLimitations.wgs84 === false ? false : true,
      webMercator: this.projectionsLimitations.webMercator === false ? false : true,
      utm: this.projectionsLimitations.utm === false ? false : true,
      mtm: this.projectionsLimitations.mtm === false ? false : true,
      utmZone: {
        minZone: utmZone && utmZone.minZone ? utmZone.minZone : 17,
        maxZone: utmZone && utmZone.maxZone ? utmZone.maxZone : 21,
      },
      mtmZone: {
        minZone: mtmZone && mtmZone.minZone ? mtmZone.minZone : 1,
        maxZone: mtmZone && mtmZone.maxZone ? mtmZone.maxZone : 10,
      }
    };
  }

  private updateProjectionsZoneChange() {
    const modifiedProj = this.projections$.value;

    const translate = this.languageService.translate;
    modifiedProj.map(p => {
      if (p.translateKey === 'mtm') {
        let zone = this.zoneMtm(this.currentCenterDefaultProj[0]);
        zone = zone < this.projectionsConstraints?.mtmZone?.minZone ? this.projectionsConstraints.mtmZone.minZone : zone;
        zone = zone > this.projectionsConstraints?.mtmZone?.maxZone ? this.projectionsConstraints.mtmZone.maxZone : zone;
        const code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
        p.alias = `MTM ${zone}`;
        p.code = code;
        p.zone = `${zone}`;
        p.translatedValue = translate.instant('igo.geo.importExportForm.projections.mtm', p);
      }
      if (p.translateKey === 'utm') {
        let zone = this.zoneUtm(this.currentCenterDefaultProj[0]);
        zone = zone < this.projectionsConstraints?.utmZone?.minZone ? this.projectionsConstraints.utmZone.minZone : zone;
        zone = zone > this.projectionsConstraints?.utmZone?.maxZone ? this.projectionsConstraints.utmZone.maxZone : zone;
        const code = `EPSG:326${zone}`;
        p.alias = `UTM ${zone}`;
        p.code = code;
        p.zone = `${zone}`;
        p.translatedValue = translate.instant('igo.geo.importExportForm.projections.utm', p);
      }

    });
    this.projections$.next(modifiedProj);

  }

  private computeProjections() {
    if (!this.projectionsConstraints) {
      this.computeProjectionsConstraints();
    }
    const projections: InputProjections[] = [];

    if (!this.currentCenterDefaultProj) {
      this.currentCenterDefaultProj = this.map.viewController.getCenter(this.defaultProj.code);
    }

    const translate = this.languageService.translate;
    if (this.projectionsConstraints.wgs84) {
      projections.push({
        translatedValue: translate.instant('igo.geo.importExportForm.projections.wgs84', { code: 'EPSG:4326' }),
        translateKey: 'wgs84', alias: 'WGS84', code: 'EPSG:4326', zone: ''
      });
    }

    if (this.projectionsConstraints.nad83) {
      projections.push({
        translatedValue: translate.instant('igo.geo.importExportForm.projections.nad83', { code: 'EPSG:4269' }),
        translateKey: 'nad83', alias: 'NAD83', code: 'EPSG:4269', zone: ''
      });
    }

    if (this.projectionsConstraints.webMercator) {
      projections.push({
        translatedValue: translate.instant('igo.geo.importExportForm.projections.webMercator', { code: 'EPSG:3857' }),
        translateKey: 'webMercator', alias: 'Web Mercator', code: 'EPSG:3857', zone: ''
      });
    }

    if (this.projectionsConstraints.mtm) {
      // Quebec
      let zone = this.zoneMtm(this.currentCenterDefaultProj[0]);
      zone = zone < this.projectionsLimitations?.mtmZone?.minZone ? this.projectionsLimitations.mtmZone.minZone : zone;
      zone = zone > this.projectionsLimitations?.mtmZone?.maxZone ? this.projectionsLimitations.mtmZone.maxZone : zone;
      const code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
      projections.push({
        translatedValue: translate.instant('igo.geo.importExportForm.projections.mtm', { code, zone }),
        translateKey: 'mtm', alias: `MTM ${zone}`, code, zone: `${zone}`
      });
    }

    if (this.projectionsConstraints.utm) {
      let zone = this.zoneUtm(this.currentCenterDefaultProj[0]);
      zone = zone < this.projectionsLimitations?.utmZone?.minZone ? this.projectionsLimitations.utmZone.minZone : zone;
      zone = zone > this.projectionsLimitations?.utmZone?.maxZone ? this.projectionsLimitations.utmZone.maxZone : zone;
      const code = `EPSG:326${zone}`;
      projections.push({
        translatedValue: translate.instant('igo.geo.importExportForm.projections.utm', { code, zone }),
        translateKey: 'utm', alias: `UTM ${zone}`, code, zone: `${zone}`
      });
    }

    let configProjection = [];
    if (this.projectionsConstraints.projFromConfig) {
      configProjection = this.config.getConfig('projections') || [];
    }
    this.projections$.next(projections.concat(configProjection));
  }

  // todo pel déplacer dans un fichier.util dans geo.. permettant de gérer les zones utm mtm
  zoneMtm(lon: number): number {
    let lonMin = -54;
    const deltaLon = 3;
    let zone = 2;
    while (Math.abs(lon - lonMin) > deltaLon) {
      lonMin = lonMin - deltaLon;
      zone++;
    }
    if (zone !== this.zoneMtm$.value) { this.zoneMtm$.next(zone); }
    return zone;
  }
  // todo pel déplacer dans un fichier.util dans geo.. permettant de gérer les zones utm mtm
  zoneUtm(lon: number): number {
    let lonMin = -54;
    const deltaLon = 6;
    let zone = 21;
    while (Math.abs(lon - lonMin) > deltaLon) {
      lonMin = lonMin - deltaLon;
      zone--;
    }
    if (zone !== this.zoneUtm$.value) {
      this.zoneUtm$.next(zone);
    }
    return zone;
  }

}
