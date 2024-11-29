import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import type { Layer } from '@igo2/geo';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

import { WorkspaceState } from '../workspace.state';

@Component({
  selector: 'igo-workspace-button',
  templateUrl: './workspace-button.component.html',
  styleUrls: ['./workspace-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class WorkspaceButtonComponent implements OnInit, OnDestroy {
  public hasWorkspace$ = new BehaviorSubject<boolean>(false);
  private hasWorkspace$$: Subscription;

  private _layer: Layer;
  private layer$ = new BehaviorSubject<Layer>(undefined);
  @Input()
  set layer(value: Layer) {
    this._layer = value;
    this.layer$.next(this._layer);
  }

  get layer(): Layer {
    return this._layer;
  }

  @Input() color = 'primary';

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
