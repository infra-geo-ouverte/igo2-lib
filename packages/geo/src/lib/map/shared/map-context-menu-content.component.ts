import { Component, TemplateRef, input, viewChild } from '@angular/core';

import {
  ActionStore,
  ActionbarComponent,
  ActionbarMode
} from '@igo2/common/action';

/**
 * Default content of the map context menu: an actionbar fed by
 * the provided ActionStore. Instantiated by MapContextMenuDirective;
 * only the inner ng-template is rendered, through the context menu
 * overlay.
 * @internal
 */
@Component({
  selector: 'igo-map-context-menu-content',
  imports: [ActionbarComponent],
  template: `
    <ng-template #menu>
      <igo-actionbar
        [store]="store()"
        [withIcon]="false"
        [horizontal]="true"
        [mode]="contextMode"
      />
    </ng-template>
  `
})
export class MapContextMenuContentComponent {
  readonly store = input.required<ActionStore>();
  readonly template = viewChild.required<TemplateRef<unknown>>('menu');
  protected readonly contextMode = ActionbarMode.Context;
}
