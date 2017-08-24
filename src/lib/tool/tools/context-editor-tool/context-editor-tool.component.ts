import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'contextEditor',
  title: 'igo.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-context-editor-tool',
  templateUrl: './context-editor-tool.component.html',
  styleUrls: ['./context-editor-tool.component.styl']
})
export class ContextEditorToolComponent {

  constructor() { }

}
