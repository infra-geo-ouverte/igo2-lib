import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'toolsContextManager',
  title: 'igo.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-tools-context-manager-tool',
  templateUrl: './tools-context-manager-tool.component.html',
  styleUrls: ['./tools-context-manager-tool.component.styl']
})
export class ToolsContextManagerToolComponent {

  constructor() { }

}
