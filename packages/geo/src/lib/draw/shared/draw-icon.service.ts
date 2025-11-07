import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

@Injectable({
  providedIn: 'root'
})
export class DrawIconService {
  protected config = inject(ConfigService);

  protected icons: string[];

  constructor() {
    this.getIconsList();
  }

  getIcons() {
    return this.icons;
  }

  getPath(): string[] {
    return this.config.getConfig('drawingTool.icons') || [];
  }

  getIconsList() {
    this.icons = this.getPath();
  }
}
