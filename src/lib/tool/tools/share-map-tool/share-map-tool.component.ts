import { Component } from '@angular/core';

import { Register } from '../../shared';

import { ShareMapToolOptions } from './share-map-tool.interface';


@Register({
  name: 'shareMap',
  title: 'igo.shareMap.share',
  icon: 'share'
})
@Component({
  selector: 'igo-share-map-tool',
  templateUrl: './share-map-tool.component.html',
  styleUrls: ['./share-map-tool.component.styl']
})
export class ShareMapToolComponent {

  public options: ShareMapToolOptions = {};

  get hasCopyLinkButton(): boolean {
    return this.options.hasCopyLinkButton === undefined ?
      false : this.options.hasCopyLinkButton;
  }

  get hasShareMapButton(): boolean {
    return this.options.hasShareMapButton === undefined ?
      false : this.options.hasShareMapButton;
  }

  constructor() { }

}
