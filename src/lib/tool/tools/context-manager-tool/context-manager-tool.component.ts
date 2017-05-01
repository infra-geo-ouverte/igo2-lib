import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'contextManager',
  title: 'igo.contexts',
  icon: 'bookmark'
})
@Component({
  selector: 'igo-context-manager-tool',
  templateUrl: './context-manager-tool.component.html',
  styleUrls: ['./context-manager-tool.component.styl']
})
export class ContextManagerToolComponent {

  constructor() { }

}
