import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { VectorLayer } from '../shared/layers/vector-layer';
import { VectorLayerOptions } from '../shared/layers/vector-layer.interface';

@Component({
  selector: 'igo-track-feature-button',
  templateUrl: './track-feature-button.component.html',
  styleUrls: ['./track-feature-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class TrackFeatureButtonComponent implements OnInit {
  @Input() layer: VectorLayer;

  @Input() trackFeature = false;

  get options(): VectorLayerOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.options;
  }

  public color = 'primary';

  constructor() {}

  ngOnInit() {
    this.color = this.trackFeature ? 'primary' : 'basic';
  }

  toggleTrackFeature() {
    if (this.trackFeature) {
      this.layer.disableTrackFeature(this.layer.options.trackFeature);
      this.color = 'basic';
    } else {
      this.layer.enableTrackFeature(this.layer.options.trackFeature);
      this.color = 'primary';
    }
    this.trackFeature = !this.trackFeature;
  }
}
