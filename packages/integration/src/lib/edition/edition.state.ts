import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { EntityRecord, Editor, EditorStore } from '@igo2/common';

/**
 * Service that holds the state of the edition module
 */
@Injectable({
  providedIn: 'root'
})
export class EditionState {

  /**
   * Observable of the active editor
   */
  public editor$ = new BehaviorSubject<Editor>(undefined);

  /**
   * Store that holds all the available editors
   */
  get store(): EditorStore { return this._store; }
  private _store: EditorStore;

  constructor() {
    this._store = new EditorStore([]);
    this._store.stateView
      .firstBy$((record: EntityRecord<Editor>) => record.state.active === true)
      .subscribe((record: EntityRecord<Editor>) => {
        const editor = record ? record.entity : undefined;
        this.editor$.next(editor);
      });
  }

}
