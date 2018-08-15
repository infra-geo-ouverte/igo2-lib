import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

import { ShareMapToolOptions } from './share-map-tool.interface';

@Register({
  name: 'shareMap',
  title: 'igo.tools.shareMap',
  icon: 'share'
})
@Component({
  selector: 'igo-share-map-tool',
  templateUrl: './share-map-tool.component.html'
})
export class ShareMapToolComponent {
  public options: ShareMapToolOptions = {};

  get hasCopyLinkButton(): boolean {
    return this.options.hasCopyLinkButton === undefined
      ? false
      : this.options.hasCopyLinkButton;
  }

  get hasShareMapButton(): boolean {
    return this.options.hasShareMapButton === undefined
      ? false
      : this.options.hasShareMapButton;
  }

  constructor() {}
}
