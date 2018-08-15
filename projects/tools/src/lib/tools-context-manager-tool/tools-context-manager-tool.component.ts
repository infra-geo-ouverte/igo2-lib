import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'toolsContextManager',
  title: 'igo.tools.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-tools-context-manager-tool',
  templateUrl: './tools-context-manager-tool.component.html'
})
export class ToolsContextManagerToolComponent {
  constructor() {}
}
