import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
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

import { IgoBadgeIconDirective } from '@igo2/common/badge';
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
        NgIf,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatBadgeModule,
        IgoBadgeIconDirective,
        IgoLanguageModule,
        LayerSearchComponent
    ],
    providers: [LayerListToolService, FormDialogService]
})
export class LayerListToolComponent {
  @Input({ required: true }) mode: LayerToolMode;
  @Input() viewerOptions: LayerViewerOptions;
  @Input() floatLabel: FloatLabelType = 'auto';
  @Input() onlyVisible: boolean;
  @Input() term: string;

  @Output() searchChange = new EventEmitter<string>();
  @Output() visibilityOnlyChange = new EventEmitter<boolean>();
  @Output() modeChange = new EventEmitter<boolean>();
  @Output() addedLayer = new EventEmitter<LayerGroup>();

  get selectionActive(): boolean {
    return this.mode === 'selection';
  }

  constructor(private layerListToolService: LayerListToolService) {}

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
