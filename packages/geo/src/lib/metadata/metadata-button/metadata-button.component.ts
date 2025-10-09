import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { Layer } from '../../layer';
import {
  MetadataLayerOptions,
  MetadataOptions
} from '../shared/metadata.interface';
import { MetadataService } from '../shared/metadata.service';

@Component({
  selector: 'igo-metadata-button',
  templateUrl: './metadata-button.component.html',
  styleUrls: ['./metadata-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule,
    MatDialogModule
  ]
})
export class MetadataButtonComponent {
  private metadataService = inject(MetadataService);
  private dialog = inject(MatDialog);

  @Input() layer: Layer;

  @Input() color = 'primary';

  openMetadata(metadata: MetadataOptions) {
    if (metadata.extern) {
      if (!metadata.url && metadata.abstract) {
        this.dialog.open(MetadataAbstractComponent, {
          data: {
            layerTitle: this.layer.title,
            abstract: metadata.abstract,
            type: metadata.type
          }
        });
      } else if (metadata.url) {
        this.metadataService.open(metadata);
      }
    } else if (!metadata.extern && metadata.abstract) {
      this.dialog.open(MetadataAbstractComponent, {
        data: {
          layerTitle: this.layer.title,
          abstract: metadata.abstract,
          type: metadata.type
        }
      });
    }
  }

  get options(): MetadataLayerOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.options;
  }
}

@Component({
  selector: 'igo-metadata-abstract',
  templateUrl: './metadata-abstract.component.html',
  styleUrls: ['./metadata-abstract.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [MatDialogTitle, MatButtonModule, MatDialogClose, MatDialogContent]
})
export class MetadataAbstractComponent {
  data = inject<MetadataOptions>(MAT_DIALOG_DATA);
}
