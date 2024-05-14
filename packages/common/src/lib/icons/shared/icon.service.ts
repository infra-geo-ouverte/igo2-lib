import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { IconSvg } from './icon.interface';

@Injectable({
  providedIn: 'root'
})
export class IconService {
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
}
