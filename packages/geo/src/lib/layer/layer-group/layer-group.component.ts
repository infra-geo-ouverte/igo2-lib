import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule
} from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { LayerViewerOptions } from '../layer-viewer/layer-viewer.interface';
import { LayerVisibilityButtonComponent } from '../layer-visibility-button';
import type { AnyLayer } from '../shared/layers/any-layer';
import type { LayerGroup } from '../shared/layers/layer-group';

@Component({
  selector: 'igo-layer-group',
  templateUrl: './layer-group.component.html',
  styleUrls: ['./layer-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    NgIf,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    LayerVisibilityButtonComponent,
    IgoLanguageModule
  ]
})
export class LayerGroupComponent implements OnInit {
  @Input() layer: LayerGroup;
  @Input() viewerOptions: LayerViewerOptions;

  @Input() selected: boolean;
  @Input() selectionDisabled: boolean;

  @Output() action = new EventEmitter<AnyLayer>(undefined);
  @Output() visibilityChange = new EventEmitter<Event>(undefined);
  @Output() expand = new EventEmitter<void>(undefined);
  @Output() selectChange = new EventEmitter<boolean>();

  @HostBinding('class.disabled') isDisabled: boolean;

  get title(): string {
    return this.layer.title;
  }

  get collapsed(): boolean {
    return this.layer.collapsed;
  }
  set collapsed(value: boolean) {
    this.layer.collapsed = value;
  }

  get tooltipMessage(): string {
    return !this.layer.isInResolutionsRange
      ? 'igo.geo.layer.notInResolution'
      : this.layer.visible && this.isDisabled
        ? 'igo.geo.layer.group.hideChildren'
        : this.layer.visible
          ? 'igo.geo.layer.group.hide'
          : 'igo.geo.layer.group.show';
  }

  ngOnInit(): void {
    this.layer.displayed$.subscribe((displayed) => {
      this.isDisabled = !displayed;
    });
  }

  onToggle(): void {
    this.collapsed = !this.collapsed;
  }

  toggleVisibility(event: Event): void {
    event.stopPropagation();
    this.visibilityChange.emit(event);
  }

  toggleLayerGroupTool(event: Event): void {
    event.stopPropagation();
    this.action.emit(this.layer);
  }

  toggleLayerTool(layer: AnyLayer): void {
    this.action.emit(layer);
  }

  handleExpand(): void {
    this.expand.emit();
  }

  handleSelect(event: MatCheckboxChange): void {
    this.selectChange.emit(event.checked);
  }
}
