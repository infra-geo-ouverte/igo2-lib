import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  ViewEncapsulation
} from '@angular/core';
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

import { Layer } from '../../layer/shared/layers/layer';
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
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule,
    MatDialogModule
  ]
})
export class MetadataButtonComponent {
  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
  }
  private _layer: Layer;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  constructor(
    private metadataService: MetadataService,
    private dialog: MatDialog
  ) {}

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
  standalone: true,
  imports: [
    MatDialogTitle,
    MatButtonModule,
    MatDialogClose,
    NgIf,
    MatDialogContent
  ]
})
export class MetadataAbstractComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MetadataOptions) {}
}
