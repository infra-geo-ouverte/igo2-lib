import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { IconSvg } from './icon.interface';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  registerSvg(icon: IconSvg): void {
    this.iconRegistry.addSvgIconLiteral(
      icon.name,
      this.sanitizer.bypassSecurityTrustHtml(icon.svg)
    );
  }
}
