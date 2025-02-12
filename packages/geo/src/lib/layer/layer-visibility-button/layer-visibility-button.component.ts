import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IconSvg, IgoIconComponent } from '@igo2/common/icon';
import { IgoLanguageModule } from '@igo2/core/language';

import { AnyLayer } from '../shared/layers/any-layer';

const EYE_CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>eye-closed</title><path d="M12 17.5C8.2 17.5 4.8 15.4 3.2 12H1C2.7 16.4 7 19.5 12 19.5S21.3 16.4 23 12H20.8C19.2 15.4 15.8 17.5 12 17.5Z" /></svg>`;

@Component({
    selector: 'igo-layer-visibility-button',
    templateUrl: './layer-visibility-button.component.html',
    styleUrls: ['./layer-visibility-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        MatBadgeModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        IgoLanguageModule,
        IgoIconComponent
    ]
})
export class LayerVisibilityButtonComponent implements OnInit {
  eyeClosedSvg: IconSvg = {
    name: 'eye-closed',
    svg: EYE_CLOSE_SVG
  };
  hiddenByParent?: boolean;
  visible: boolean;

  @Input({ required: true }) layer: AnyLayer;
  @Input() tooltip: string;
  @Input() disabled: boolean;
  @Input() showQueryBadge: boolean;
  @Input() inResolutionsRange: boolean;

  get defaultTooltip(): string {
    return !this.layer.isInResolutionsRange
      ? 'igo.geo.layer.notInResolution'
      : this.layer.visible && this.disabled
        ? 'igo.geo.layer.group.hideChildren'
        : this.layer.visible
          ? 'igo.geo.layer.hideLayer'
          : 'igo.geo.layer.showLayer';
  }

  @Output() visibilityChange = new EventEmitter<Event>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.layer.parent?.displayed$.subscribe((displayed) => {
      this.hiddenByParent = !displayed;
      this.cdr.markForCheck();
    });

    this.layer.visible$.subscribe((visible) => {
      this.visible = visible;
      this.cdr.markForCheck();
    });
  }

  toggle(event: Event) {
    this.layer.visible = !this.layer.visible;
    this.visibilityChange.emit(event);
  }
}
