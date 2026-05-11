import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { type AnyLayer, isLayerItem } from '@igo2/geo';

import { combineLatest } from 'rxjs';

import { WorkspaceState } from '../workspace.state';

@Component({
  selector: 'igo-workspace-button',
  templateUrl: './workspace-button.component.html',
  styleUrls: ['./workspace-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class WorkspaceButtonComponent implements OnInit {
  private workspaceState = inject(WorkspaceState);
  private destroyRef = inject(DestroyRef);

  public hasWorkspace = signal(false);

  readonly layer = input<AnyLayer>();

  readonly color = input('primary');

  ngOnInit(): void {
    combineLatest([
      this.workspaceState.workspaceEnabled$,
      toObservable(this.layer)
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([enabled, layer]) => {
        const withWorkspace =
          enabled &&
          !!layer &&
          isLayerItem(layer) &&
          (layer.options.workspace?.enabled ?? false);
        this.hasWorkspace.set(withWorkspace);
      });
  }

  activateWorkspace() {
    const layer = this.layer();
    if (
      this.workspaceState.workspace$.value &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.workspaceState.workspace$.value as any).layer.id === layer?.id &&
      this.workspaceState.expanded()
    ) {
      this.workspaceState.expanded.set(false);
    } else {
      this.workspaceState.expanded.set(true);
      if (layer?.id) {
        this.workspaceState.setActiveWorkspaceById(layer.id);
      }
    }
  }
}
