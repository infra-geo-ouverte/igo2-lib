import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'shareMap',
  title: 'igo.integration.tools.shareMap',
  icon: 'share'
})
@Component({
  selector: 'igo-context-share-tool',
  templateUrl: './context-share-tool.component.html'
})
export class ShareMapToolComponent {

  @Input() hasCopyLinkButton: boolean = false;

  @Input() hasShareMapButton: boolean = true;

  constructor() {}
}
