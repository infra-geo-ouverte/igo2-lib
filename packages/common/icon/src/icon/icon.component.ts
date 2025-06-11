import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IconSvg } from '../shared';
import { IconService } from '../shared/icon.service';

@Component({
  selector: 'igo-icon',
  imports: [MatIconModule],
  templateUrl: './icon.component.html'
})
export class IgoIconComponent {
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

  constructor(private iconService: IconService) {}

  registerSvg(icon: IconSvg): void {
    this.iconService.registerSvg(icon);
  }

  isSvg(icon: string | IconSvg): icon is IconSvg {
    return typeof icon != 'string';
  }
}
