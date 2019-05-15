import { EntityStore } from '../../entity';
import { Editor } from './editor';

/**
 * The class is a specialized version of an EntityStore that stores
 * editors.
 */
export class EditorStore extends EntityStore<Editor> {

  /**
   * Register an editor and make it available
   * @param editor Editor
   */
  register(editor: Editor) {
    this.insert(editor);
  }

  /**
   * Unregister an editor and make it unavailable
   * @param editor Editor
   */
  unregister(editor: Editor) {
    this.delete(editor);
  }

  /**
   * Activate the an editor editor and deactivate the one currently active
   * @param editor Editor
   */
  activateEditor(editor: Editor) {
    this.deactivateEditor();
    if (editor !== undefined) {
      this.state.update(editor, {active: true, selected: true}, true);
      editor.activate();
    }
  }

  /**
   * Deactivate the current editor
   * @param editor Editor
   */
  deactivateEditor() {
    const active = this.view.firstBy((_editor: Editor) => _editor.isActive() === true);
    if (active !== undefined) {
      active.deactivate();
    }
  }

}
