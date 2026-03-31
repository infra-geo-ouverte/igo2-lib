import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';

import { IgoBadgeIconDirective } from '@igo2/common/badge';
import { IconSvg, IgoIconComponent } from '@igo2/common/icon';
import { IgoLanguageModule, LanguageService } from '@igo2/core/language';

import { of, switchMap } from 'rxjs';

import { getFilterBadge } from '../../datasource/shared/datasources/wms-wfs.utils';
import { AnyLayer } from '../shared/layers/any-layer';
import { isLayerItem } from '../utils';

const EYE_CLOSE_BY_GROUP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.5C8.2 17.5 4.8 15.4 3.2 12H1C2.7 16.4 7 19.5 12 19.5S21.3 16.4 23 12H20.8C19.2 15.4 15.8 17.5 12 17.5Z" /></svg>`;

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
    IgoIconComponent,
    IgoBadgeIconDirective
  ]
})
export class LayerVisibilityButtonComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private languageService = inject(LanguageService);

  eyeClosedByGroupSvg: IconSvg = {
    name: 'eye-closed',
    svg: EYE_CLOSE_BY_GROUP_SVG
  };
  readonly layer = input.required<AnyLayer>();
  readonly tooltip = input<string>(undefined);
  readonly disabled = input<boolean>(undefined);
  readonly showQueryBadge = input<boolean>(undefined);
  readonly inResolutionsRange = input<boolean>(undefined);

  readonly parentDisplayed = toSignal(
    toObservable(this.layer).pipe(
      switchMap((layer) => layer.parent$),
      switchMap((parent) => (parent ? parent.displayed$ : of(undefined)))
    ),
    { initialValue: false }
  );

  readonly visible = toSignal(
    toObservable(this.layer).pipe(switchMap((layer) => layer.visible$))
  );

  readonly badge = computed(() => this.getBadge(this.layer()));

  defaultTooltipText = computed(() => {
    return this.languageService.translate.instant(
      this.tooltip() ?? this.getDefaultTooltip()
    );
  });

  readonly tooltipText = computed(() => {
    const tooltip = this.defaultTooltipText();
    if (this.badge()) {
      return (
        `${tooltip}. ` +
        this.languageService.translate.instant(
          'igo.geo.layer.filterAppliedOnLayer'
        )
      );
    }
    return tooltip;
  });

  readonly visibilityChange = output<Event>();

  constructor() {
    this.iconRegistry.addSvgIconLiteral(
      'eye-closed-by-group',
      this.sanitizer.bypassSecurityTrustHtml(EYE_CLOSE_BY_GROUP_SVG)
    );
  }

  toggle(event: Event) {
    this.layer().visible = !this.layer().visible;
    this.visibilityChange.emit(event);
  }

  private getBadge(layer: AnyLayer): number | undefined {
    return isLayerItem(layer)
      ? getFilterBadge(layer.dataSource.options)
      : undefined;
  }

  private getDefaultTooltip(): string {
    return !this.inResolutionsRange()
      ? 'igo.geo.layer.notInResolution'
      : this.visible() && this.disabled()
        ? 'igo.geo.layer.group.hideChildren'
        : this.visible()
          ? 'igo.geo.layer.hideLayer'
          : 'igo.geo.layer.showLayer';
  }
}
