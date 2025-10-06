import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IconSvg } from '../shared';
import { IconService } from '../shared/icon.service';

@Component({
  selector: 'igo-icon',
  imports: [MatIconModule],
  templateUrl: './icon.component.html',
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `
})
export class IgoIconComponent {
  private iconService = inject(IconService);

  @Input() color: string | null | undefined;

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

  registerSvg(icon: IconSvg): void {
    this.iconService.registerSvg(icon);
  }

  isSvg(icon: string | IconSvg): icon is IconSvg {
    return typeof icon != 'string';
  }
}
