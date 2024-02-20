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
        if (!action) {
          return 'indeterminate';
        }
        const { type } = action;
        if (
          type !== PackageManagerActionType.INSTALLING &&
          type !== PackageManagerActionType.DOWNLOADING
        ) {
          return 'indeterminate';
        }

        const { progress } = action;
        return progress === undefined ? 'indeterminate' : 'determinate';
      })
    );
  }

  get progress$(): Observable<number> {
    return this.action$.pipe(
      map((action) => {
        if (!action) {
          return 0;
        }
        const { type } = action;
        if (
          type !== PackageManagerActionType.INSTALLING &&
          type !== PackageManagerActionType.DOWNLOADING
        ) {
          return 0;
        }

        const { progress } = action;
        return progress === undefined ? 0 : progress * 100;
      })
    );
  }
}
