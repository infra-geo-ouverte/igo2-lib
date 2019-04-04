import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { getEntityTitle } from '../../entity';
import { Editor } from '../shared/editor';
import { EditorStore } from '../shared/store';

/**
 * Drop list that activates the selected editor emit an event.
 */
@Component({
  selector: 'igo-editor-selector',
  templateUrl: './editor-selector.component.html',
  styleUrls: ['./editor-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorSelectorComponent {

  /**
   * Store that holds the available editors.
   */
  @Input() store: EditorStore;

  /**
   * Event emitted when an editor is selected or unselected
   */
  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    entity: Editor;
  }>();

  /**
   * @internal
   */
  getEditorTitle(editor: Editor): string {
    return getEntityTitle(editor);
  }

  /**
   * When an editor is manually selected, select it into the
   * store and emit an event.
   * @internal
   * @param event The selection change event
   */
  onSelectedChange(event: {entity: Editor}) {
    const editor = event.entity;
    this.store.activateEditor(editor);
    this.selectedChange.emit({selected: true, entity: editor});
  }

}
