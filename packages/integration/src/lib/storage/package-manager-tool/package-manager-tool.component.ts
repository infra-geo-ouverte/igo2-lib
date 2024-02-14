import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';

import {
  EntityStore,
  EntityTablePaginatorOptions,
  EntityTableTemplate,
  IgoEntityTableModule,
  ToolComponent,
  getEntityProperty
} from '@igo2/common';
import { PackageManagerService } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

interface PackageSelectionData {
  name: string;
}

@ToolComponent({
  name: 'packageManager',
  title: 'igo.integration.tools.packageManager', // TODO change to igo.integration.tools.packageManager
  icon: 'cloud-download'
})
@Component({
  selector: 'igo-package-manager-tool',
  standalone: true,
  imports: [CommonModule, IgoEntityTableModule, MatButtonModule],
  templateUrl: './package-manager-tool.component.html',
  styleUrls: ['./package-manager-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageManagerToolComponent implements OnInit {
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

  get packages() {
    return this.packageManagerService.packages;
  }

  get packages$() {
    return this.packageManagerService.packages$;
  }

  constructor(private packageManagerService: PackageManagerService) {}

  ngOnInit(): void {
    this.packages$.subscribe((packages) => {
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

  onSubmit(data: PackageSelectionData): void {
    console.log('onSubmit');
  }

  downloadSelectedPackage() {
    if (!this.selectedPackage) {
      console.log('selected package undefined');
      return;
    }
    this.packageManagerService.downloadPackage(this.selectedPackage.title);
  }

  deleteSelectedPackage() {
    if (!this.selectedPackage) {
      return;
    }

    console.log('deleting package');

    const downloaded = {
      ...this.selectedPackage,
      totalFiles: 10
    };
    this.packageManagerService.deletePackage(downloaded);
  }
}
