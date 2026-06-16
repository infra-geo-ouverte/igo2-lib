import { Feature } from '../../../feature/shared';
import { FeatureEdit } from './feature-edit';

export type EditionMode = 'modify' | 'create';

const MAX_EDIT_CAPACITY = 1;

export class EditionSession {
  readonly mode: EditionMode;
  private readonly edits: Set<FeatureEdit> = new Set();

  constructor(mode: EditionMode) {
    this.mode = mode;
  }

  get isEmpty(): boolean {
    return this.edits.size === 0;
  }

  get isFull(): boolean {
    return this.edits.size >= MAX_EDIT_CAPACITY;
  }

  get single(): FeatureEdit | undefined {
    return [...this.edits].at(0);
  }

  includes(feature: Feature): boolean {
    for (const edit of this.edits) {
      if (edit.feature === feature) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds a feature to the edition session, creating a FeatureEdit for it. The feature's `edition` flag is set to true.
   * @param feature
   * @throws Error if the session has reached its maximum edit capacity.
   */
  add(feature: Feature): FeatureEdit {
    if (this.isFull)
      throw new Error('EditionSession has reached maximum edit capacity');

    const edit = new FeatureEdit(feature);
    this.edits.add(edit);
    return edit;
  }

  /**
   * Removes a feature from the edition session
   * @param feature
   * @throws Error if the feature is not found in the session.
   */
  remove(feature: Feature): void {
    // find edit, delete feature.edition flag, splice out
    const edit = [...this.edits].find((edit) => edit.feature === feature);
    if (!edit) throw new Error('Feature not found in edition session');

    this.edits.delete(edit);
  }
}
