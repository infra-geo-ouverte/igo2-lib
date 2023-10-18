import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import type { Layer } from '@igo2/geo';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

import { WorkspaceState } from '../workspace.state';

@Component({
  selector: 'igo-workspace-button',
  templateUrl: './workspace-button.component.html',
  styleUrls: ['./workspace-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceButtonComponent implements OnInit, OnDestroy {
  public hasWorkspace$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private hasWorkspace$$: Subscription;

  private _layer: Layer;
  private layer$: BehaviorSubject<Layer> = new BehaviorSubject(undefined);
  @Input()
  set layer(value: Layer) {
    this._layer = value;
    this.layer$.next(this._layer);
  }

  get layer(): Layer {
    return this._layer;
  }

  @Input() color: string = 'primary';

  constructor(private workspaceState: WorkspaceState) {}

  ngOnInit(): void {
    this.hasWorkspace$$ = combineLatest([
      this.workspaceState.workspaceEnabled$,
      this.layer$
    ]).subscribe((bunch) =>
      this.hasWorkspace$.next(bunch[0] && bunch[1]?.options.workspace?.enabled)
    );
  }

  ngOnDestroy(): void {
    this.hasWorkspace$$.unsubscribe();
  }

  activateWorkspace() {
    if (
      this.workspaceState.workspace$.value &&
      (this.workspaceState.workspace$.value as any).layer.id ===
        this.layer.id &&
      this.workspaceState.workspacePanelExpanded
    ) {
      this.workspaceState.workspacePanelExpanded = false;
    } else {
      this.workspaceState.workspacePanelExpanded = true;
      this.workspaceState.setActiveWorkspaceById(this.layer.id);
    }
  }
}
