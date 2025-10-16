import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import {
  FloatLabelType,
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FormDialogService } from '@igo2/common/form';
import { IgoLanguageModule } from '@igo2/core/language';

import { LayerSearchComponent } from '../layer-search/layer-search.component';
import {
  LayerToolMode,
  LayerViewerOptions
} from '../layer-viewer/layer-viewer.interface';
import { LayerGroup } from '../shared/layers/layer-group';
import { LayerListToolService } from './layer-list-tool.service';

@Component({
  selector: 'igo-layer-list-tool',
  templateUrl: './layer-list-tool.component.html',
  styleUrls: ['./layer-list-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatBadgeModule,
    IgoLanguageModule,
    LayerSearchComponent
  ],
  providers: [LayerListToolService, FormDialogService]
})
export class LayerListToolComponent {
  private layerListToolService = inject(LayerListToolService);

  readonly mode = input.required<LayerToolMode>();
  readonly viewerOptions = input<LayerViewerOptions>(undefined);
  readonly floatLabel = input<FloatLabelType>('auto');
  readonly onlyVisible = input<boolean>(undefined);
  readonly term = input<string>(undefined);

  readonly searchChange = output<string>();
  readonly visibilityOnlyChange = output<boolean>();
  readonly modeChange = output<boolean>();
  readonly addedLayer = output<LayerGroup>();

  get selectionActive(): boolean {
    return this.mode() === 'selection';
  }

  handleTermChange(value: string | undefined): void {
    this.searchChange.emit(value);
  }

  toggleSelectionMode() {
    this.modeChange.emit(!this.selectionActive);
  }

  createGroup(): void {
    this.layerListToolService.createGroup().subscribe((group) => {
      if (!group) {
        return;
      }
      this.addedLayer.emit(group);
    });
  }
}
