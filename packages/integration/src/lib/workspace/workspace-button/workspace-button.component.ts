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
import { type AnyLayer, isLayerItem } from '@igo2/geo';

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

  private layer$ = new BehaviorSubject<AnyLayer>(undefined);
  @Input()
  set layer(value: AnyLayer) {
    this._layer = value;
    this.layer$.next(this._layer);
  }
  get layer(): AnyLayer {
    return this._layer;
  }
  private _layer: AnyLayer;

  @Input() color = 'primary';

  constructor(private workspaceState: WorkspaceState) {}

  ngOnInit(): void {
    this.hasWorkspace$$ = combineLatest([
      this.workspaceState.workspaceEnabled$,
      this.layer$
    ]).subscribe(([enabled, layer]) =>
      this.hasWorkspace$.next(
        enabled && isLayerItem(layer) && layer.options.workspace?.enabled
      )
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
