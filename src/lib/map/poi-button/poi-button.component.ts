import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MdDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';

import { MessageService, LanguageService } from '../../core';
import { ConfirmDialogService } from '../../shared';
import { AuthService, PoiService, Poi } from '../../auth';
import { IgoMap } from '../shared';
import { PoiDialogComponent } from './poi-dialog.component';

@Component({
  selector: 'igo-poi-button',
  templateUrl: './poi-button.component.html',
  styleUrls: ['./poi-button.component.styl']
})
export class PoiButtonComponent implements OnInit, OnDestroy {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color(): string { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  public pois: Poi[];
  private authenticate$$: Subscription;

  constructor(
    private dialog: MdDialog,
    private authService: AuthService,
    private poiService: PoiService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.authenticate$$ = this.authService.authenticate$
      .subscribe((auth) => {
        if (auth) {
          this.getPois();
        }
      });
  }

  ngOnDestroy() {
    this.authenticate$$.unsubscribe();
  }

  deletePoi(poi: Poi) {
    if (poi && poi.id) {
      const translate = this.languageService.translate;
      this.confirmDialogService
        .open(translate.instant('igo.poiButton.dialog.confirmDelete'))
        .subscribe((confirm) => {
          if (confirm) {
            this.poiService.delete(poi.id).subscribe(() => {
              const title = translate.instant('igo.poiButton.dialog.deleteTitle');
              const message = translate.instant('igo.poiButton.dialog.deleteMsg', {
                value: poi.title
              });
              this.messageService.info(message, title);
              this.pois = this.pois.filter((p) => p.id !== poi.id);
            });
          }
        });
    }
  }

  private getPois() {
    this.poiService.get().subscribe((rep) => {
      this.pois = rep;
    });
  }

  createPoi() {
    const view = this.map.ol.getView();
    const proj = view.getProjection().getCode();
    const center: any = new ol.geom.Point(view.getCenter()).transform(proj, 'EPSG:4326');

    const poi: Poi = {
      title: '',
      x: center.getCoordinates()[0],
      y: center.getCoordinates()[1],
      zoom: view.getZoom()
    };

    this.dialog.open(PoiDialogComponent, {disableClose: false})
      .afterClosed().subscribe((title) => {
        if (title) {
          poi.title = title;
          this.poiService.create(poi).subscribe((newPoi) => {
            const translate = this.languageService.translate;
            const titleD = translate.instant('igo.poiButton.dialog.createTitle');
            const message = translate.instant('igo.poiButton.dialog.createMsg', {
              value: poi.title
            });
            this.messageService.info(message, titleD);
            poi.id = newPoi.id;
            this.pois.push(poi);
          });
        }
      });
  }

  zoomOnPoi(id) {
    const poi = this.pois.find((p) => p.id === id);

    const center = ol.proj.fromLonLat([Number(poi.x), Number(poi.y)], this.map.projection);

    this.map.ol.getView().animate({
      center: center,
      zoom: poi.zoom,
      duration: 500,
      easing: ol.easing.easeOut
    });
  }

}
