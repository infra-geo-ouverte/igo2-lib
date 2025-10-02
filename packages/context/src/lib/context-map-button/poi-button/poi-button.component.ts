import { NgFor } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '@igo2/auth';
import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { StopPropagationDirective } from '@igo2/common/stop-propagation';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import type { IgoMap } from '@igo2/geo';

import * as oleasing from 'ol/easing';
import olPoint from 'ol/geom/Point';
import * as olproj from 'ol/proj';

import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { PoiDialogComponent } from './poi-dialog.component';
import { Poi } from './shared/poi.interface';
import { PoiService } from './shared/poi.service';

@Component({
  selector: 'igo-poi-button',
  templateUrl: './poi-button.component.html',
  styleUrls: ['./poi-button.component.scss'],
  imports: [
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    StopPropagationDirective,
    MatIconModule,
    MatDividerModule,
    NgFor,
    IgoLanguageModule
  ],
  providers: [PoiService]
})
export class PoiButtonComponent implements OnInit, OnDestroy {
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

  public pois: Poi[];
  private authenticate$$: Subscription;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private poiService: PoiService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.authenticate$$ = this.authService.authenticate$.subscribe((auth) => {
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
      this.confirmDialogService
        .open(
          this.languageService.translate.instant(
            'igo.context.poiButton.dialog.confirmDelete'
          )
        )
        .subscribe((confirm) => {
          if (confirm) {
            this.poiService.delete(poi.id).subscribe(
              () => {
                this.messageService.info(
                  'igo.context.poiButton.dialog.deleteMsg',
                  'igo.context.poiButton.dialog.deleteTitle',
                  undefined,
                  { value: poi.title }
                );
                this.pois = this.pois.filter((p) => p.id !== poi.id);
              },
              (err) => {
                err.error.title = 'DELETE Pois';
                this.messageService.showError(err);
              }
            );
          }
        });
    }
  }

  private getPois() {
    this.poiService
      .get()
      .pipe(take(1))
      .subscribe(
        (rep) => {
          this.pois = rep;
        },
        (err) => {
          err.error.title = 'GET Pois';
          this.messageService.showError(err);
        }
      );
  }

  createPoi() {
    const view = this.map.ol.getView();
    const proj = view.getProjection().getCode();
    const center: any = new olPoint(view.getCenter()).transform(
      proj,
      'EPSG:4326'
    );

    const poi: Poi = {
      title: '',
      x: center.getCoordinates()[0],
      y: center.getCoordinates()[1],
      zoom: view.getZoom()
    };

    this.dialog
      .open(PoiDialogComponent, { disableClose: false })
      .afterClosed()
      .subscribe((title) => {
        if (title) {
          poi.title = title;
          this.poiService.create(poi).subscribe(
            (newPoi) => {
              this.messageService.success(
                'igo.context.poiButton.dialog.createMsg',
                'igo.context.poiButton.dialog.createTitle',
                undefined,
                { value: poi.title }
              );
              poi.id = newPoi.id;
              this.pois.push(poi);
            },
            (err) => {
              err.error.title = 'POST Pois';
              this.messageService.showError(err);
            }
          );
        }
      });
  }

  zoomOnPoi(id) {
    const poi = this.pois.find((p) => p.id === id);

    const center = olproj.fromLonLat(
      [Number(poi.x), Number(poi.y)],
      this.map.projection
    );

    this.map.ol.getView().animate({
      center,
      zoom: poi.zoom,
      duration: 500,
      easing: oleasing.easeOut
    });
  }
}
