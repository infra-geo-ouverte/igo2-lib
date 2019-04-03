import { EntityStore } from '../../entity';
import { Editor } from './editor';

/**
 * The class is a specialized version of an EntityStore that stores
 * editors.
 */
export class EditorStore extends EntityStore<Editor> {

  /**
   * Activate the an editor editor and deactivate the one currently active
   * @param editor Editor
   */
  activateEditor(editor: Editor) {
    const active = this.view.firstBy((_editor: Editor) => _editor.isActive() === true);
    if (active !== undefined) {
      active.deactivate();
    }
    if (editor !== undefined) {
      this.state.update(editor, {active: true, selected: true}, true);
      editor.activate();
    }
  }

}
