import { Component, effect, inject, input } from '@angular/core';
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

  readonly color = input<string | null | undefined>(undefined);

  readonly icon = input.required<string | IconSvg>();

  constructor() {
    effect(() => {
      const currentIcon = this.icon();
      if (this.isSvg(currentIcon)) {
        this.registerSvg(currentIcon);
      }
    });
  }

  registerSvg(icon: IconSvg): void {
    this.iconService.registerSvg(icon);
  }

  isSvg(icon: string | IconSvg): icon is IconSvg {
    return typeof icon != 'string';
  }
}
