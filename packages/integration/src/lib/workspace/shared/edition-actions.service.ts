import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';

import { Action } from '@igo2/common/action';
import { Widget } from '@igo2/common/widget';
import { LanguageService } from '@igo2/core/language';
import { MediaService } from '@igo2/core/media';
import {
  StorageService,
  StorageServiceEvent,
  StorageServiceEventEnum
} from '@igo2/core/storage';
import { EditionWorkspace, OgcFilterWidget } from '@igo2/geo';

import { BehaviorSubject, Subscription } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import { StorageState } from '../../storage/storage.state';
import { ToolState } from '../../tool/tool.state';
import { getWorkspaceActions, handleZoomAuto } from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class EditionActionsService implements OnDestroy {
  public maximize$: BehaviorSubject<boolean>;

  zoomAuto$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private storageChange$$: Subscription;

  get storageService(): StorageService {
    return this.storageState.storageService;
  }

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  constructor(
    @Optional()
    @Inject(OgcFilterWidget)
    private ogcFilterWidget: Widget,
    private storageState: StorageState,
    public languageService: LanguageService,
    private mediaService: MediaService,
    private toolState: ToolState
  ) {
    this.maximize$ = new BehaviorSubject(
      this.storageService.get('workspaceMaximize') as boolean
    );
  }

  ngOnDestroy(): void {
    if (this.storageChange$$) {
      this.storageChange$$.unsubscribe();
    }
  }

  loadActions(
    workspace: EditionWorkspace,
    rowsInMapExtentCheckCondition$: BehaviorSubject<boolean>,
    selectOnlyCheckCondition$: BehaviorSubject<boolean>
  ) {
    const actions = this.buildActions(
      workspace,
      rowsInMapExtentCheckCondition$,
      selectOnlyCheckCondition$
    );
    workspace.actionStore.load(actions);
  }

  buildActions(
    workspace: EditionWorkspace,
    rowsInMapExtentCheckCondition$: BehaviorSubject<boolean>,
    selectOnlyCheckCondition$: BehaviorSubject<boolean>
  ): Action[] {
    this.zoomAuto$.next(this.zoomAuto);
    this.storageChange$$ = this.storageService.storageChange$
      .pipe(
        skipWhile(
          (storageChange: StorageServiceEvent) =>
            storageChange?.key !== 'zoomAuto' ||
            storageChange?.event === StorageServiceEventEnum.CLEARED
        )
      )
      .subscribe(() => {
        this.zoomAuto$.next(this.zoomAuto);
        handleZoomAuto(workspace, this.storageService);
      });
    return getWorkspaceActions(
      workspace,
      rowsInMapExtentCheckCondition$,
      selectOnlyCheckCondition$,
      this.ogcFilterWidget,
      this.zoomAuto$,
      this.maximize$,
      this.storageService,
      this.languageService,
      this.mediaService,
      this.toolState
    );
  }
}
