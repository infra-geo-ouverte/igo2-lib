import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'permissionsContextManager',
  title: 'igo.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-permissions-context-manager-tool',
  templateUrl: './permissions-context-manager-tool.component.html',
  styleUrls: ['./permissions-context-manager-tool.component.styl']
})
export class PermissionsContextManagerToolComponent {

  constructor() { }

}
