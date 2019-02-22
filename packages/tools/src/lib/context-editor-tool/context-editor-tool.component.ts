import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'contextEditor',
  title: 'igo.tools.contexts',
  icon: 'settings'
})
@Component({
  selector: 'igo-context-editor-tool',
  templateUrl: './context-editor-tool.component.html'
})
export class ContextEditorToolComponent {
  constructor() {}
}
