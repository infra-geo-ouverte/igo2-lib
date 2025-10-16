import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  model
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { VectorLayer } from '../shared/layers/vector-layer';

@Component({
  selector: 'igo-track-feature-button',
  templateUrl: './track-feature-button.component.html',
  styleUrls: ['./track-feature-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class TrackFeatureButtonComponent implements OnInit {
  readonly layer = input<VectorLayer>(undefined);

  trackFeature = model(false);

  public color = 'primary';

  ngOnInit() {
    this.color = this.trackFeature() ? 'primary' : 'basic';
  }

  toggleTrackFeature() {
    const trackFeature = this.trackFeature();
    if (trackFeature) {
      this.layer().disableTrackFeature();
      this.color = 'basic';
    } else {
      this.layer().enableTrackFeature(this.layer().options.trackFeature);
      this.color = 'primary';
    }
    this.trackFeature.set(!trackFeature);
  }
}
