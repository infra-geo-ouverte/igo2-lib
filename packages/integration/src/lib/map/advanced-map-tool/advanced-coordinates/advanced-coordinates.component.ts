import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IgoMap, MapViewController } from '@igo2/geo';
import { MapState } from '../../map.state';
import { Clipboard } from '@igo2/utils';
import { MessageService, LanguageService, StorageService, StorageScope } from '@igo2/core';
import { Subscription } from 'rxjs';

/**
 * Tool to display the coordinates and a cursor of the center of the map
 */
@Component({
  selector: 'igo-advanced-coordinates',
  templateUrl: './advanced-coordinates.component.html',
  styleUrls: ['./advanced-coordinates.component.scss']
})
export class AdvancedCoordinatesComponent implements OnInit, OnDestroy, AfterViewInit {

  get map(): IgoMap {
    return this.mapState.map;
  }
  public coordinates: string[];
  public center: boolean = false;
  private mapState$$: Subscription;
  // private mapController: MapViewController;

  constructor(
    public mapState: MapState,
    private languageService: LanguageService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService) { }

  ngOnInit(): void {
    this.getCoordinates();
    this.mapState$$ = this.map.viewController.state$.subscribe(c => {
        this.getCoordinates();
        this.cdRef.detectChanges();
      });
    this.checkTogglePosition();
  }

  ngOnDestroy(): void{
    this.mapState$$.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getCoordinates();
  }

  /**
   * Longitude and latitude of the center of the map
   */
  getCoordinates(){
    this.coordinates = this.map.viewController.getCenter('EPSG:4326').map(coord => coord.toFixed(5));
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
    this.map.mapCenter$.next(toggle);
    this.storageService.set('centerToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Set the toggle position in a current value
   */
  checkTogglePosition(){
    if (this.storageService.get('centerToggle') === true){
      this.center = true;
    }
  }
}
