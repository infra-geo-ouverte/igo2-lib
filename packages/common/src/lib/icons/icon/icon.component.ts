import { Component, Input } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { IconSvg } from '../shared';

@Component({
  selector: 'igo-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './icon.component.html'
})
export class IgoIconComponent {
  @Input({ required: true })
  set icon(icon: string | IconSvg) {
    if (this.isSvg(icon)) {
      this.registerSvg(icon);
    }

    this._icon = icon;
  }
  get icon(): string | IconSvg {
    return this._icon;
  }
  private _icon: string | IconSvg;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {}

  registerSvg(icon: IconSvg): void {
    this.iconRegistry.addSvgIconLiteral(
      icon.name,
      this.sanitizer.bypassSecurityTrustHtml(icon.svg)
    );
  }

  isSvg(icon: string | IconSvg): icon is IconSvg {
    return typeof icon != 'string';
  }
}
