import { CommonModule } from '@angular/common';
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
import { PackageManagerService } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-download-package',
  standalone: true,
  imports: [CommonModule, IgoEntityTableModule, MatButtonModule],
  templateUrl: './download-package.component.html',
  styleUrls: ['./download-package.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadPackageComponent implements OnInit {
  public store: EntityStore = new EntityStore([]);
  public paginator: MatPaginator;
  entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);
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
      }
    ]
  };

  entitySortChange(): void {
    this.entitySortChange$.next(true);
  }

  get nonDownloaded() {
    return this.packageManagerService.nonDownloaded;
  }

  get nonDownloaded$() {
    return this.packageManagerService.nonDownloaded$;
  }

  constructor(private packageManagerService: PackageManagerService) {}

  ngOnInit(): void {
    this.nonDownloaded$.subscribe((packages) => {
      const transformed = packages.map((avail) => {
        const { size, ...other } = avail;
        const sizeInMB = (size / (1024 * 1024)).toFixed(1);
        return {
          ...other,
          size: sizeInMB
        };
      });
      this.store.clear();
      this.store.load(transformed);
    });
  }

  downloadSelectedPackage() {
    if (!this.selectedPackage) {
      console.log('selected package undefined');
      return;
    }
    this.packageManagerService.downloadPackage(this.selectedPackage.title);
  }
}
