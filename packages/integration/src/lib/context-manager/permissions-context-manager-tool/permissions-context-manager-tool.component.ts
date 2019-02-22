import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'permissionsContextManager',
  title: 'igo.integration.tools.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-permissions-context-manager-tool',
  templateUrl: './permissions-context-manager-tool.component.html'
})
export class PermissionsContextManagerToolComponent {
  constructor() {}
}
