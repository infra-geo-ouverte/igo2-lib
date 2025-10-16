import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
  input,
  output
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
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    LayerVisibilityButtonComponent,
    IgoLanguageModule
  ]
})
export class LayerGroupComponent implements OnInit {
  readonly layer = input<LayerGroup>(undefined);
  readonly viewerOptions = input<LayerViewerOptions>(undefined);

  readonly selected = input<boolean>(undefined);
  readonly selectionDisabled = input<boolean>(undefined);

  readonly action = output<AnyLayer>();
  readonly visibilityChange = output<Event>();
  readonly expand = output();
  readonly selectChange = output<boolean>();

  @HostBinding('class.disabled') isDisabled: boolean;

  get title(): string {
    return this.layer().title;
  }

  get collapsed(): boolean {
    return this.layer().collapsed;
  }
  set collapsed(value: boolean) {
    this.layer().collapsed = value;
  }

  get tooltipMessage(): string {
    const layer = this.layer();
    return !layer.isInResolutionsRange
      ? 'igo.geo.layer.notInResolution'
      : layer.visible && this.isDisabled
        ? 'igo.geo.layer.group.hideChildren'
        : layer.visible
          ? 'igo.geo.layer.group.hide'
          : 'igo.geo.layer.group.show';
  }

  ngOnInit(): void {
    this.layer().displayed$.subscribe((displayed) => {
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
    this.action.emit(this.layer());
  }

  toggleLayerTool(layer: AnyLayer): void {
    this.action.emit(layer);
  }

  handleExpand(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.expand.emit();
  }

  handleSelect(event: MatCheckboxChange): void {
    this.selectChange.emit(event.checked);
  }
}
