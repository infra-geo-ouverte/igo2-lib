import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import {
  EntityStore,
  EntityTableComponent,
  EntityTableTemplate,
  getEntityProperty
} from '@igo2/common';
import { PackageInfo, PackageManagerService } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-download-package',
  standalone: true,
  imports: [
    CommonModule,
    EntityTableComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './download-package.component.html',
  styleUrls: ['./download-package.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadPackageComponent implements OnInit {
  @Output() download = new EventEmitter<PackageInfo>();
  @ViewChild('entityTable') entityTable: EntityTableComponent;

  public store: EntityStore = new EntityStore([]);
  entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  selectedPackage = undefined;

  search: string = '';

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
      const transformed = packages.map((avail) => this.transformPackage(avail));
      this.store.clear();
      this.store.load(transformed);
    });

    this.packageManagerService.action$.subscribe((action) => {
      const isSelectionToggled = !action;
      this.setSelection(isSelectionToggled);
    });
  }

  private transformPackage(info: PackageInfo) {
    const { size, ...other } = info;
    const sizeInMB = (size / (1000 * 1000)).toFixed(1);
    return {
      ...other,
      size: sizeInMB
    };
  }

  filterPackages() {
    console.log('searching packages');

    const filtered = this.nonDownloaded
      .filter(({ title }) => title.includes(this.search))
      .map((info) => this.transformPackage(info));

    console.log('filtered', filtered);
    this.store.clear();
    this.store.load(filtered);
  }

  downloadSelectedPackage() {
    if (!this.selectedPackage) {
      console.log('selected package undefined');
      return;
    }
    this.download.next(this.selectedPackage);
    this.packageManagerService.downloadPackage(this.selectedPackage.title);
  }

  refreshPackages() {
    this.packageManagerService.actualizePackages();
  }

  private setSelection(value: boolean) {
    this.template.selection = value;
    this.template.selectionCheckbox = value;
    this.entityTable?.refresh();
  }
}
