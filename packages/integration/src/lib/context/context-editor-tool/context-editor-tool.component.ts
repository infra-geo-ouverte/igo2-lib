import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import {
  ContextEditBindingDirective,
  ContextEditComponent
} from '@igo2/context';

import { ToolState } from '../../tool/tool.state';

@ToolComponent({
  name: 'contextEditor',
  title: 'igo.integration.tools.contexts',
  icon: 'star',
  parent: 'contextManager'
})
@Component({
  selector: 'igo-context-editor-tool',
  templateUrl: './context-editor-tool.component.html',
  imports: [ContextEditComponent, ContextEditBindingDirective]
})
export class ContextEditorToolComponent {
  constructor(private toolState: ToolState) {}

  submitSuccessed() {
    this.toolState.toolbox.activatePreviousTool();
  }
}
