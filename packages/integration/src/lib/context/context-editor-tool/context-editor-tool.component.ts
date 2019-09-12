import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'contextEditor',
  title: 'igo.integration.tools.contexts',
  icon: 'star',
  parent: 'contextManager'
})
@Component({
  selector: 'igo-context-editor-tool',
  templateUrl: './context-editor-tool.component.html'
})
export class ContextEditorToolComponent {}
