import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';

import { IgoBadgeIconDirective } from '@igo2/common/badge';
import { IconSvg, IgoIconComponent } from '@igo2/common/icon';
import { IgoLanguageModule, LanguageService } from '@igo2/core/language';
import { getFilterBadge } from '@igo2/geo';

import { AnyLayer } from '../shared/layers/any-layer';
import { isLayerItem } from '../utils';

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
    IgoIconComponent,
    IgoBadgeIconDirective
  ]
})
export class LayerVisibilityButtonComponent implements OnInit {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private languageService = inject(LanguageService);

  eyeClosedSvg: IconSvg = {
    name: 'eye-closed',
    svg: EYE_CLOSE_SVG
  };
  parentDisplayed = signal<boolean>(undefined);
  visible = signal<boolean>(undefined);

  readonly layer = input.required<AnyLayer>();
  readonly tooltip = input<string>(undefined);
  readonly disabled = input<boolean>(undefined);
  readonly showQueryBadge = input<boolean>(undefined);
  readonly inResolutionsRange = input<boolean>(undefined);

  badge = signal<number | undefined>(undefined);

  defaultTooltipText = computed(() => {
    return this.languageService.translate.instant(
      this.tooltip() ?? this.getDefaultTooltip()
    );
  });

  tooltipText = computed(() => {
    const tooltip = this.defaultTooltipText();
    if (this.badge()) {
      return (
        `${tooltip}. ` +
        this.languageService.translate.instant(
          'igo.geo.layer.filterAppliedOnLayer'
        )
      );
    }
  });

  readonly visibilityChange = output<Event>();

  constructor() {
    this.iconRegistry.addSvgIconLiteral(
      'eye-closed',
      this.sanitizer.bypassSecurityTrustHtml(EYE_CLOSE_SVG)
    );
  }

  ngOnInit(): void {
    const layer = this.layer();
    this.visible.set(layer.visible);

    layer.parent?.displayed$.subscribe((displayed) => {
      this.parentDisplayed.set(displayed);
    });

    layer.visible$.subscribe((visible) => {
      this.visible.set(visible);
    });

    this.badge.set(this.getBadge());
  }

  toggle(event: Event) {
    this.layer().visible = !this.layer().visible;
    this.visibilityChange.emit(event);
  }

  private getBadge(): number | undefined {
    const result = isLayerItem(this.layer())
      ? getFilterBadge(this.layer().dataSource.options)
      : undefined;

    return result;
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
