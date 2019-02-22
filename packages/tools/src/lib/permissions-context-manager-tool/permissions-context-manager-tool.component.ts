import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'permissionsContextManager',
  title: 'igo.tools.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-permissions-context-manager-tool',
  templateUrl: './permissions-context-manager-tool.component.html'
})
export class PermissionsContextManagerToolComponent {
  constructor() {}
}
