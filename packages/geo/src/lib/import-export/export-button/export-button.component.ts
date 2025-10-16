import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { Layer, VectorLayer } from '../../layer/shared';

@Component({
  selector: 'igo-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class ExportButtonComponent {
  readonly layer = input<Layer>(undefined);

  readonly color = input('primary');

  readonly isExportable = computed<boolean>(() => {
    const layer = this.layer();
    const download = layer?.dataSource.options.download;
    const workspace = layer?.options.workspace;
    if (
      (layer instanceof VectorLayer && layer?.exportable === true) ||
      download?.url ||
      (workspace?.enabled && workspace?.workspaceId !== layer?.id)
    ) {
      return true;
    }
    return false;
  });
}
