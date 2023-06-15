import { Inject, Injectable, OnDestroy } from '@angular/core';

import { Action, Widget } from '@igo2/common';

import { BehaviorSubject, Subscription } from 'rxjs';
import {
  WfsWorkspace, OgcFilterWidget } from '@igo2/geo';
import { StorageService, StorageServiceEvent, StorageServiceEventEnum, LanguageService, MediaService} from '@igo2/core';
import { StorageState } from '../../storage/storage.state';
import { skipWhile } from 'rxjs/operators';
import { ToolState } from '../../tool/tool.state';
import { getWorkspaceActions, handleZoomAuto } from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class WfsActionsService implements OnDestroy {

  public maximize$: BehaviorSubject<boolean> = new BehaviorSubject(
    this.storageService.get('workspaceMaximize') as boolean
  );

  selectOnlyCheckCondition$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // rowsInMapExtentCheckCondition$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  zoomAuto$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private storageChange$$: Subscription;

  get storageService(): StorageService {
    return this.storageState.storageService;
  }

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  constructor(
    @Inject(OgcFilterWidget) private ogcFilterWidget: Widget,
    private storageState: StorageState,
    public languageService: LanguageService,
    private mediaService: MediaService,
    private toolState: ToolState) {}

  ngOnDestroy(): void {
    if (this.storageChange$$) {
      this.storageChange$$.unsubscribe();
    }
  }

  loadActions(
    workspace: WfsWorkspace,
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
    workspace: WfsWorkspace,
    rowsInMapExtentCheckCondition$: BehaviorSubject<boolean>,
    selectOnlyCheckCondition$: BehaviorSubject<boolean>
  ): Action[] {
    this.zoomAuto$.next(this.zoomAuto);
    this.storageChange$$ = this.storageService.storageChange$
      .pipe(skipWhile((storageChange: StorageServiceEvent) =>
        storageChange?.key !== 'zoomAuto' || storageChange?.event === StorageServiceEventEnum.CLEARED))
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
      this.toolState);
  }
}
