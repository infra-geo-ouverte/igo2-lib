import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { Layer } from '../../layer';
import { DownloadDataSourceOptions } from '../shared/download.interface';
import { DownloadService } from '../shared/download.service';

@Component({
  selector: 'igo-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class DownloadButtonComponent {
  private downloadService = inject(DownloadService);

  readonly layer = input<Layer>(undefined);

  readonly color = input('primary');
  readonly options = computed<DownloadDataSourceOptions>(
    () => this.layer()?.dataSource.options
  );

  openDownload() {
    this.downloadService.open(this.layer());
  }
}
