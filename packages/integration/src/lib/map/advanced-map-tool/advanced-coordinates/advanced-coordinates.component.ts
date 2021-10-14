import { ChangeDetectorRef, Component, OnDestroy, OnInit, Input } from '@angular/core';
import { IgoMap, InputProjections, ProjectionsLimitationsOptions } from '@igo2/geo';
import { MapState } from '../../map.state';
import { Clipboard } from '@igo2/utils';
import { MessageService, LanguageService, StorageService, StorageScope, ConfigService } from '@igo2/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { zoneMtm, zoneUtm, computeProjectionsConstraints } from '@igo2/geo';
import * as olproj from 'ol/proj';
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
  private inMtmZone: boolean = true;
  private inLambert2 = {32198: true, 3798: true};
  private mapState$$: Subscription;
  private _projectionsLimitations: ProjectionsLimitationsOptions = {};
  private projectionsConstraints: ProjectionsLimitationsOptions;
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

  /**
   * Listen a state of the map, a state of a form, update the coordinates
   */
  ngOnInit(): void {
    this.mapState$$ = combineLatest([this.map.viewController.state$.pipe(debounceTime(50)), this.form.valueChanges])
        .subscribe(() => {
      this.currentCenterDefaultProj = this.map.viewController.getCenter(this.defaultProj.code);
      const currentMtmZone = zoneMtm(this.currentCenterDefaultProj[0]);
      const currentUtmZone = zoneUtm(this.currentCenterDefaultProj[0]);
      if (!this.inMtmZone && currentMtmZone !== this.currentZones.mtm) {
        this.back2quebec();
      }
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
      this.checkLambert(this.currentCenterDefaultProj);
      this.coordinates = this.getCoordinates();
      this.cdRef.detectChanges();
      this.storageService.set('currentProjection', this.inputProj, StorageScope.SESSION);
    });

    const tempInputProj = this.storageService.get('currentProjection') as InputProjections;
    this.inputProj = this.projections$.value[0];
    if (tempInputProj !== null)
    {
      const pos = this.positionInList(tempInputProj);
      this.inputProj = this.projections$.value[pos];
      this.updateZoneMtmUtm();
    }
    this.map.mapCenter$.next(this.center);
    this.coordinates = this.getCoordinates();
    this.currentCenterDefaultProj = this.map.viewController.getCenter(this.defaultProj.code);
  }

  ngOnDestroy(): void {
    this.map.mapCenter$.next(false);
    this.mapState$$.unsubscribe();
  }

  /**
   * Coordinates of the center of the map on the appropriate systeme of coordinates
   * @returns Array of two numbers
   */
  getCoordinates(): string[] {
    this.currentZones.mtm = zoneMtm(this.currentCenterDefaultProj[0]);
    this.currentZones.utm = zoneUtm(this.currentCenterDefaultProj[0]);
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
  copyTextToClipboard(): void {
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
  displayCenter(toggle: boolean): void {
    this.center = toggle;
    this.map.mapCenter$.next(toggle);
    this.storageService.set('centerToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Builder of the form
   */
  private buildForm(): void {
    this.form = this.formBuilder.group({
      inputProj: ['', [Validators.required]]
    });
  }

  /**
   * Update list of projections after changing of the state of the map
   */
  private updateProjectionsZoneChange(): void {
    let modifiedProj = this.projections$.value;
    const translate = this.languageService.translate;
    modifiedProj.map(p => {
      if (p.translateKey === 'mtm') {
        const zone = zoneMtm(this.currentCenterDefaultProj[0]);
        if (zone) {
          const code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
          p.alias = `MTM ${zone}`;
          p.code = code;
          p.zone = `${zone}`;
          p.translatedValue = translate.instant('igo.geo.importExportForm.projections.mtm', p);
        }
        else {
          p.alias = '';
          this.inMtmZone = false;
          if (this.inputProj.translateKey === 'mtm') {
            this.inputProj = this.projections$.value[0];
          }
        }
      }
      if (p.translateKey === 'utm') {
        const zone = zoneUtm(this.currentCenterDefaultProj[0]);
        const code = `EPSG:326${zone}`;
        p.alias = `UTM ${zone}`;
        p.code = code;
        p.zone = `${zone}`;
        p.translatedValue = translate.instant('igo.geo.importExportForm.projections.utm', p);
      }
    });
    modifiedProj = modifiedProj.filter(p => p.alias !== '');
    this.projections$.next(modifiedProj);
  }

  /**
   * Create a list of currents projections
   */
  private computeProjections(): void {
    this.projectionsConstraints = computeProjectionsConstraints(this.projectionsLimitations);
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
      const zone = zoneMtm(this.currentCenterDefaultProj[0]);
      if (zone) {
        this.inMtmZone = true;
        const code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
        projections.splice(3, 0, {
          translatedValue: this.languageService.translate.instant('igo.geo.importExportForm.projections.mtm', { code, zone }),
          translateKey: 'mtm', alias: `MTM ${zone}`, code, zone: `${zone}`
        });
      }
      else {
        this.inMtmZone = false;
      }
    }
    if (this.projectionsConstraints.utm) {
      const order = this.inMtmZone ? 4 : 3;
      const zone = zoneUtm(this.currentCenterDefaultProj[0]);
      const code = zone < 10 ? `EPSG:3260${zone}` : `EPSG:326${zone}`;
      projections.splice(order, 0, {
        translatedValue: this.languageService.translate.instant('igo.geo.importExportForm.projections.utm', { code, zone }),
        translateKey: 'utm', alias: `UTM ${zone}`, code, zone: `${zone}`
      });
    }
    let configProjection = [];
    if (this.projectionsConstraints.projFromConfig) {
      configProjection = this.config.getConfig('projections') || [];
    }
    this.projections$.next(projections.concat(configProjection));
  }

  /**
   * Push the MTM in the array of systeme of coordinates
   * @param projections Array of the InputProjections
   */
  private pushMtm(projections: Array<InputProjections>): void {
    if (this.projectionsConstraints.mtm) {
      const zone = zoneMtm(this.currentCenterDefaultProj[0]);
      const code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
      projections.splice(3, 0, {
          translatedValue: this.languageService.translate.instant('igo.geo.importExportForm.projections.mtm', { code, zone }),
          translateKey: 'mtm', alias: `MTM ${zone}`, code, zone: `${zone}`});
    }
  }

  /**
   * Updates the list of systems of coordinates for territory of Quebec
   * push MTM and UTM in the Array
   */
  private back2quebec(): void {
    const projections = this.projections$.value;
    this.pushMtm(projections);
    this.inMtmZone = true;
  }

  /**
   * Update the numbers of the zones when application is restarted
   */
  private updateZoneMtmUtm() {
    if (this.inputProj.translateKey === 'mtm') {
      const zone = zoneMtm(this.currentCenterDefaultProj[0]);
      this.inputProj.alias = `MTM ${zone}`;
      const code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
      this.inputProj.code = code;
      this.inputProj.zone = `${zone}`;
      this.inputProj.translatedValue = this.languageService.translate.instant('igo.geo.importExportForm.projections.mtm', { code, zone });
    }
    if (this.inputProj.translateKey === 'utm') {
      const zone = zoneUtm(this.currentCenterDefaultProj[0]);
      this.inputProj.alias = `UTM ${zone}`;
      const code = zone < 10 ? `EPSG:3260${zone}` : `EPSG:326${zone}`;
      this.inputProj.code = code;
      this.inputProj.zone = `${zone}`;
      this.inputProj.translatedValue = this.languageService.translate.instant('igo.geo.importExportForm.projections.utm', { code, zone });
    }
  }

  /**
   * Compute the position of a current projection in a list. 0 if the projection is not in the list
   * @param translateKey string, translate key of a projection
   * @returns numeric, position of an element in the array
   */
  positionInList(tempInputProj: InputProjections): number {
    const tk = tempInputProj.translateKey;
    const alias = tempInputProj.alias;
    let position; // = undefined;
    let iter = 0;
    this.projections$.value.map((projection) => {
      if (tk) {
        if (tk === projection.translateKey) {
          position = iter;
        }
      }
      else if (alias === projection.alias) {
        position = iter;
      }
      iter++;
    });
    position = position ? position : 0;
    return position;
  }

  /**
   * Change the list of projections depending on the projections of Lambert
   * @param coordinates An array of numbers, longitude and latitude
   */
  checkLambert(coordinates: [number, number]) {
    const lambertProjections = this.config.getConfig('projections');
    lambertProjections.forEach(projection => {
        let modifiedProj = this.projections$.value;
        const extent = projection.extent;
        const code = projection.code.match(/\d+/);
        const currentExtentWGS = olproj.transformExtent(extent, projection.code, this.defaultProj.code);
        if (coordinates[0] < currentExtentWGS[0] || coordinates[0] > currentExtentWGS[2] ||
            coordinates[1] < currentExtentWGS[1] || coordinates[1] > currentExtentWGS[3]) {
            this.inLambert2[code] = false;
            if (this.inputProj.alias === projection.alias) {
              this.inputProj = this.projections$.value[0];
            }
            modifiedProj = modifiedProj.filter(p => p.alias !== projection.alias);
            this.projections$.next(modifiedProj);
        }
        else {
            if (!this.inLambert2[code]) {
                this.projections$.next(modifiedProj.concat(projection));
                this.inLambert2[code] = true;
            }
        }
    });
  }
}
