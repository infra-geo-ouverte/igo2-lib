import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

import { ToolState } from '../../tool/tool.state';
import { ContextEditBindingDirective } from '../../../../../context/src/lib/context-manager/context-edit/context-edit-binding.directive';
import { ContextEditComponent } from '../../../../../context/src/lib/context-manager/context-edit/context-edit.component';

@ToolComponent({
  name: 'contextEditor',
  title: 'igo.integration.tools.contexts',
  icon: 'star',
  parent: 'contextManager'
})
@Component({
    selector: 'igo-context-editor-tool',
    templateUrl: './context-editor-tool.component.html',
    standalone: true,
    imports: [ContextEditComponent, ContextEditBindingDirective]
})
export class ContextEditorToolComponent {
  constructor(private toolState: ToolState) {}

  submitSuccessed() {
    this.toolState.toolbox.activatePreviousTool();
  }
}
