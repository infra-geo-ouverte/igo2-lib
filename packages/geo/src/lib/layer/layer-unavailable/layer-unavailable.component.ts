import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { AnyLayerItemOptions, AnyLayerOptions } from '../shared';

@Component({
  selector: 'igo-layer-unavailable',
  templateUrl: './layer-unavailable.component.html',
  styleUrls: ['./layer-unavailable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatListModule, MatIconModule, MatTooltipModule, IgoLanguageModule]
})
export class LayerUnavailableComponent {
  @Input() layerOptions: AnyLayerItemOptions;

  @Output() remove = new EventEmitter<AnyLayerOptions>();

  get title(): string | undefined {
    const sourceOptions = this.layerOptions.sourceOptions;
    return (
      this.layerOptions.title ??
      sourceOptions?.['params']?.LAYERS ??
      sourceOptions?.['params']?.layers ??
      sourceOptions?.['layer']
    );
  }

  handleRemove(layerOptions: AnyLayerOptions): void {
    this.remove.emit(layerOptions);
  }
}
