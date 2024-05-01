import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { StyleModalLayerComponent } from '../layer/style-modal-layer.component';
import { LayerMatDialogData } from '../shared/style-modal.interface';

@Component({
  selector: 'igo-style-modal-layer-button',
  templateUrl: './style-modal-layer-button.component.html',
  styleUrls: ['./style-modal-layer-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class StyleModalLayerButtonComponent {
  @Input() layer: VectorLayer;
  constructor(private dialog: MatDialog) {}

  /**
   * Open the style modal dialog box
   */
  openStyleModalDialog() {
    setTimeout(() => {
      // open the dialog box used to style features
      const data: LayerMatDialogData = { layer: this.layer };
      const dialogRef = this.dialog.open(StyleModalLayerComponent, {
        disableClose: false,
        data,
        autoFocus: false
      });
    }, 250);
  }
}
