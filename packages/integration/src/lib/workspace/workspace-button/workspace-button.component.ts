import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Layer, VectorLayer } from '@igo2/geo';
import { WorkspaceState } from '../workspace.state';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'igo-workspace-button',
  templateUrl: './workspace-button.component.html',
  styleUrls: ['./workspace-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceButtonComponent implements OnInit, OnDestroy {

  public hasWorkspace$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private hasWorkspace$$: Subscription;

  @Input() layer: Layer;

  @Input() color: string = 'primary';

  constructor(private workspaceState: WorkspaceState) {}

  ngOnInit(): void {
    this.hasWorkspace$$  = this.workspaceState.workspaceEnabled$.subscribe(wksEnabled =>
      (wksEnabled && this.layer instanceof VectorLayer) ? this.hasWorkspace$.next(true) : this.hasWorkspace$.next(false)
    );
  }

  ngOnDestroy(): void {
    this.hasWorkspace$$.unsubscribe();
  }

  activateWorkspace() {
    if (
      this.workspaceState.workspace$.value &&
      (this.workspaceState.workspace$.value as any).layer.id === this.layer.id &&
      this.workspaceState.workspacePanelExpanded) {
        this.workspaceState.workspacePanelExpanded = false;
    } else {
      this.workspaceState.workspacePanelExpanded = true;
      this.workspaceState.setActiveWorkspaceByLayerId(this.layer.id);
    }
  }
}
