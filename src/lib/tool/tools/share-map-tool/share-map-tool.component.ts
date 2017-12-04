import { Component } from '@angular/core';

import { Register } from '../../shared';


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

  constructor() { }

}
