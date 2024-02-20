import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
  PackageManagerAction,
  PackageManagerActionType,
  PackageManagerService
} from '@igo2/geo';

import { Observable, map } from 'rxjs';

@Component({
  selector: 'igo-package-progress-status',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './package-progress-status.component.html',
  styleUrls: ['./package-progress-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageProgressStatusComponent {
  constructor(private packageManager: PackageManagerService) {}

  get action$(): Observable<PackageManagerAction> {
    return this.packageManager.action$;
  }

  get action() {
    return this.packageManager.action;
  }

  getActionTitle(action: PackageManagerAction | undefined) {
    if (!action) {
      return '';
    }

    const { type } = action;
    switch (type) {
      case PackageManagerActionType.DELETING:
        return 'Deleting';
      case PackageManagerActionType.INSTALLING:
        return 'Installing';
      case PackageManagerActionType.DOWNLOADING:
        return 'Downloading';
      default:
        throw Error(`Get action title not implemented for ${type}`);
    }
  }

  get barMode$() {
    return this.action$.pipe(
      map((action) => {
        return action?.type === PackageManagerActionType.INSTALLING
          ? 'determinate'
          : 'indeterminate';
      })
    );
  }

  get progress$(): Observable<number> {
    return this.action$.pipe(
      map((action) => {
        return action?.type === PackageManagerActionType.INSTALLING
          ? action.progress * 100
          : 0;
      })
    );
  }
}
