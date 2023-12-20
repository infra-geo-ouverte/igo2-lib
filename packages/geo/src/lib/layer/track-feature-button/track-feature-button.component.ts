import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

import { VectorLayer } from '../shared/layers/vector-layer';
import { VectorLayerOptions } from '../shared/layers/vector-layer.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
    selector: 'igo-track-feature-button',
    templateUrl: './track-feature-button.component.html',
    styleUrls: ['./track-feature-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatTooltipModule, MatIconModule, TranslateModule]
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

  public color: string = 'primary';

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
