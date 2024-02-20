import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';

import {
  EntityStore,
  EntityTablePaginatorOptions,
  EntityTableTemplate,
  IgoEntityTableModule,
  getEntityProperty
} from '@igo2/common';
import { DevicePackageInfo, PackageManagerService } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

import { PackageProgressStatusComponent } from './package-progress-status/package-progress-status.component';

@Component({
  selector: 'igo-downloaded-packages-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    IgoEntityTableModule,
    PackageProgressStatusComponent
  ],
  templateUrl: './downloaded-packages-manager.component.html',
  styleUrls: ['./downloaded-packages-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadedPackagesManagerComponent implements OnInit {
  private datePipe = new DatePipe('en-US');
  public store: EntityStore = new EntityStore([]);
  public paginator: MatPaginator;
  public entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  public paginatorOptions: EntityTablePaginatorOptions = { pageSize: 10 };

  selectedPackage = undefined;

  public template: EntityTableTemplate = {
    selection: true,
    selectionCheckbox: true,
    // selectMany: true, TODO activate with download queue
    sort: true,
    valueAccessor: (entity: object, name: string) => {
      if (
        this.store.state.get(entity).selected &&
        this.selectedPackage !== entity
      ) {
        this.selectedPackage = entity;
      }

      if (
        this.selectedPackage === entity &&
        !this.store.state.get(entity).selected
      ) {
        this.selectedPackage = undefined;
      }

      return getEntityProperty(entity, name);
    },
    columns: [
      {
        name: 'title',
        title: 'Title'
      },
      {
        name: 'size',
        title: 'Size (MB)'
      },
      {
        name: 'expiration',
        title: 'Expiration'
      }
    ]
  };

  entitySortChange(): void {
    this.entitySortChange$.next(true);
  }

  get downloaded() {
    return this.packageManager.downloaded;
  }

  get downloaded$() {
    return this.packageManager.downloaded$;
  }

  constructor(private packageManager: PackageManagerService) {}

  ngOnInit(): void {
    this.downloaded$.subscribe((downloaded) => {
      const transformed = downloaded.map((p) => this.formatPackage(p));
      this.store.clear();
      this.store.load(transformed);
    });
  }

  private formatPackage(downloaded: DevicePackageInfo) {
    const { size, expiration, ...other } = downloaded;
    const sizeInMB = (size / (1000 * 1000)).toFixed(1);
    const formatedExp = this.datePipe.transform(expiration, 'dd-MM-YYYY');
    return {
      ...other,
      expiration: formatedExp,
      size: sizeInMB
    };
  }

  deleteSelectedPackage() {
    if (!this.selectedPackage) {
      return;
    }
    this.packageManager.deletePackage(this.selectedPackage);
  }
}
