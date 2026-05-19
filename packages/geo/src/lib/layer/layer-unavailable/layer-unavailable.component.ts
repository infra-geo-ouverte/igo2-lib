import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    IgoLanguageModule
  ]
})
export class LayerUnavailableComponent {
  readonly layerOptions = input<AnyLayerItemOptions>();

  readonly remove = output<AnyLayerOptions>();

  get title(): string | undefined {
    const sourceOptions = this.layerOptions()?.sourceOptions as Record<
      string,
      Record<string, unknown>
    >;
    return (this.layerOptions()?.title ??
      sourceOptions?.['params']?.['LAYERS'] ??
      sourceOptions?.['params']?.['layers'] ??
      sourceOptions?.['layer']) as string | undefined;
  }

  handleRemove(layerOptions: AnyLayerOptions): void {
    this.remove.emit(layerOptions);
  }
}
