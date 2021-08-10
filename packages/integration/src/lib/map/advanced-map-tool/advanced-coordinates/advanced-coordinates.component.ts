import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Input } from '@angular/core';
import { IgoMap,  InputProjections, ProjectionsLimitationsOptions,  MapViewController } from '@igo2/geo';
import { MapState } from '../../map.state';
import { Clipboard } from '@igo2/utils';
import { MessageService, LanguageService, StorageService, StorageScope, ConfigService } from '@igo2/core';
import { BehaviorSubject, Subscription } from 'rxjs';
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
  public center: boolean = false;
  private mapState$$: Subscription;
  private zoneMtm$$: Subscription;
  private zoneUtm$$: Subscription;
  private _projectionsLimitations: ProjectionsLimitationsOptions = {};
  private projectionsConstraints: ProjectionsLimitationsOptions;
  private zoneMtm$: BehaviorSubject<number> = new BehaviorSubject(0);
  private zoneUtm$: BehaviorSubject<number> = new BehaviorSubject(0);
  public units: boolean = true;
  get map(): IgoMap {
    return this.mapState.map;
  }

  get inputProj() {
    return this.form.get('inputProj').value;
  }
  set inputProj(value) {
    this.form.patchValue({ inputProj: value });
  }
  get projectionsLimitations(): ProjectionsLimitationsOptions {
    return this._projectionsLimitations || {};
  }

  @Input()
  set projectionsLimitations(value: ProjectionsLimitationsOptions) {
    this._projectionsLimitations = value;
    this.computeProjections();
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
    this.computeProjections(); // initialiser les projections
    this.getCoordinates();
    this.mapState$$ = this.map.viewController.state$.pipe(debounceTime(1500)).subscribe(() => {
      this.computeProjections();  // afficher après le déplacement. même si on choisit lon-lat, on a besoin
                                  // de mettre à jour mtm et utm.
      this.zoneControl(); // vérifie si la zone a été changée, mets à jour form.controls['inputProj']
      this.getCoordinates(); // affiche les coordonnées
      this.cdRef.detectChanges();
      });
    this.checkTogglePosition();
  }

  ngOnDestroy(): void {
    this.mapState$$.unsubscribe();
    if (this.zoneMtm$$) {
      this.zoneMtm$$.unsubscribe();
    }
    if (this.zoneUtm$$) {
      this.zoneUtm$$.unsubscribe();
    }
  }

  /**
   * Longitude and latitude of the center of the map
   */
  getCoordinates(): void {
    let code = this.inputProj.code;
    if (code && !(code.includes('EPSG:4326') || code.includes('EPSG:4269'))) {
      if (code.includes('EPSG:321')){
        this.zoneMtm$.subscribe(zone =>  {
          code = zone < 10 ? `EPSG:3218${zone}` : `EPSG:321${80 + zone}`;
          // this.cdRef.detectChanges();
      });
      }
      if (code.includes('EPSG:326')){
        this.zoneUtm$.subscribe(zone => {
          code = `EPSG:326${zone}`;
          // this.cdRef.detectChanges();
        });
      }
      this.coordinates = this.map.viewController.getCenter(code).map(coord => coord.toFixed(2));
    }
    else if (code && code.includes('EPSG:4269')) {
        this.coordinates = this.map.viewController.getCenter(code).map(coord => coord.toFixed(5));
    }
    else {
        this.coordinates = this.map.viewController.getCenter('EPSG:4326').map(coord => coord.toFixed(5));
    }
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
  displayCenter(toggle: boolean){
    this.center = toggle;
    // this.mapState.mapCenter$.next(toggle);
    this.map.mapCenter$.next(toggle);
    this.storageService.set('centerToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Set the toggle position in a current value
   */
  checkTogglePosition() {
    if (this.storageService.get('centerToggle') === true){
      this.center = true;
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      inputProj: ['', [Validators.required]]
    });
  }

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

  private computeProjections() {
    if (!this.projectionsConstraints) {
      this.computeProjectionsConstraints();
    }
    const projections: InputProjections[] = [];

    if (this.projectionsConstraints.wgs84) {
      projections.push({ translateKey: 'wgs84', alias: 'WGS84', code: 'EPSG:4326', zone: '' });
    }

    if (this.projectionsConstraints.nad83) {
      projections.push({ translateKey: 'nad83', alias: 'NAD83', code: 'EPSG:4269', zone: '' });
    }

    if (this.projectionsConstraints.webMercator) {
      projections.push({ translateKey: 'webMercator', alias: 'Web Mercator', code: 'EPSG:3857', zone: '' });
    }

    if (this.projectionsConstraints.mtm) {
      // Quebec
      const mtmZone = this.zoneMtm(this.map.viewController.getCenter('EPSG:4326')[0]);
      const code = mtmZone < 10 ? `EPSG:3218${mtmZone}` : `EPSG:321${80 + mtmZone}`;
      projections.push({ translateKey: 'mtm', alias: `MTM ${mtmZone}`, code, zone: `${mtmZone}` });
    }

    if (this.projectionsConstraints.utm) {
      // Quebec
      const utmZone = this.zoneUtm(this.map.viewController.getCenter('EPSG:4326')[0]);
      const code =  `EPSG:326${utmZone}`;
      projections.push({ translateKey: 'utm', alias: `UTM ${utmZone}`, code, zone: `${utmZone}` });
    }

    let configProjection = [];
    if (this.projectionsConstraints.projFromConfig) {
      configProjection = this.config.getConfig('projections') || [];
    }
    this.projections$.next(projections.concat(configProjection));
  }



/* pourquoi les 2 projections qui vient de config.getConfig restent affichés pendant le déplacement de la carte?
je mets à jour this.inputProj, mais pourtant [(value)] dans html ne se mets pas à jour dans la forme)
*/


  public onlySelectedClick(event, code: string) {
    event.stopPropagation();
    this.getCoordinates();
    this.changeUnits(code);
  }

  changeUnits(code: string){
    this.units = (code === 'EPSG:4326' || code === 'EPSG:4269'); }

  zoneMtm(lon: number): number {
    let lonMin = -54;
    const deltaLon = 3;
    let zone = 2;
    while (Math.abs(lon - lonMin) > deltaLon){
      lonMin = lonMin - deltaLon;
      zone ++;
    }
    if (zone !== this.zoneMtm$.value) {this.zoneMtm$.next(zone); }
    return zone;
  }

  zoneUtm(lon: number): number {
    let lonMin = -54;
    const deltaLon = 6;
    let zone = 21;
    while (Math.abs(lon - lonMin) > deltaLon) {
      lonMin = lonMin - deltaLon;
      zone --;
    }
    if (zone !== this.zoneUtm$.value) {
      this.zoneUtm$.next(zone);
    }
    return zone;
  }

  zoneControl() {
    if (this.inputProj && (this.inputProj.code.includes('EPSG:321') || this.inputProj.code.includes('EPSG:326'))) {
      const mtmZone = this.zoneMtm(this.map.viewController.getCenter('EPSG:4326')[0]);
      this.zoneMtm$$ = this.zoneMtm$.pipe(debounceTime(250)).subscribe(zone => {
        if (this.inputProj.translateKey === 'mtm'){
            this.form.patchValue({inputProj:
              {translateKey: 'mtm', alias: `MTM ${zone}`, code: `EPSG:3218${zone}`, zone: `${zone}`}});
        }
      });
      const utmZone = this.zoneUtm(this.map.viewController.getCenter('EPSG:4326')[0]);
      this.zoneUtm$$ = this.zoneUtm$.pipe(debounceTime(250)).subscribe(zone => {
        if (this.inputProj.translateKey === 'utm'){
            this.form.patchValue({inputProj:
              {translateKey: 'utm', alias: `UTM ${zone}`, code: `EPSG:326${zone}`, zone: `${zone}`}});
        }
      });
    }
  }

  setInputProj(event) {
    console.log(this.form.controls['inputProj'].value);
  }

}
