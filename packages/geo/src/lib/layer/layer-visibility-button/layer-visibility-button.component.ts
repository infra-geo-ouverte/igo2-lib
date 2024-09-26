import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CIRCLE_SMALL_ICON, IgoIconComponent } from '@igo2/common/icon';
import { IgoLanguageModule } from '@igo2/core/language';

import { AnyLayer } from '../shared/layers/any-layer';

@Component({
  selector: 'igo-layer-visibility-button',
  templateUrl: './layer-visibility-button.component.html',
  styleUrls: ['./layer-visibility-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    IgoLanguageModule,
    IgoIconComponent
  ]
})
export class LayerVisibilityButtonComponent {
  circleSmallIcon = CIRCLE_SMALL_ICON;

  @Input({ required: true }) layer: AnyLayer;
  @Input() tooltip: string;
  @Input() disabled: boolean;
  @Input() showQueryBadge: boolean;
  @Input() inResolutionsRange: boolean;

  get defaultTooltip(): string {
    return !this.layer.isInResolutionsRange
      ? 'igo.geo.layer.notInResolution'
      : this.layer.visible && this.disabled
        ? 'igo.geo.layer.group.hideChildren'
        : this.layer.visible
          ? 'igo.geo.layer.hideLayer'
          : 'igo.geo.layer.showLayer';
  }

  @Output() visibilityChange = new EventEmitter<Event>();

  toggle(event: Event) {
    this.layer.visible = !this.layer.visible;
    this.visibilityChange.emit(event);
  }
}
