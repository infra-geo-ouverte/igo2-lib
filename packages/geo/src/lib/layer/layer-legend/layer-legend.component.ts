import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SanitizeHtmlPipe } from '@igo2/common/custom-html';
import { SecureImagePipe } from '@igo2/common/image';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources';
import { Layer, Legend } from '../shared/layers';
import { LayerLegendWmsSelectorComponent } from './layer-legend-wms-selector';

@Component({
  selector: 'igo-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    MatTooltipModule,
    AsyncPipe,
    IgoLanguageModule,
    SanitizeHtmlPipe,
    SecureImagePipe,
    LayerLegendWmsSelectorComponent
  ]
})
export class LayerLegendComponent implements OnInit, OnDestroy {
  @Input() layer: Layer;

  public currentLegend$ = new BehaviorSubject<Legend>(undefined);
  private subscriptions$$: Subscription[] = [];
  get currentLegend() {
    return this.currentLegend$.getValue();
  }

  constructor() {}

  ngOnInit() {
    const sub = this.layer.legends$.subscribe((legends) => {
      this.currentLegend$.next(legends[0]);
    });
    this.subscriptions$$.push(sub);
  }

  /**
   * On destroy, unsubscribe
   */
  ngOnDestroy() {
    this.subscriptions$$.forEach((f) => f.unsubscribe());
  }

  isValidLegend(): boolean {
    return this.currentLegend.htmls?.length || this.currentLegend.urls?.length
      ? true
      : false;
  }

  isWMSDataSource(): boolean {
    return this.layer.dataSource instanceof WMSDataSource;
  }
}
