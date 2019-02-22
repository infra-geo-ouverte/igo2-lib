import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'toolsContextManager',
  title: 'igo.integration.tools.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-tools-context-manager-tool',
  templateUrl: './tools-context-manager-tool.component.html'
})
export class ToolsContextManagerToolComponent {
  constructor() {}
}
