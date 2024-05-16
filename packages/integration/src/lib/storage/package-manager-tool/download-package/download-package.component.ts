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
} from '@igo2/common/entity';
import { IgoIconComponent } from '@igo2/common/icon';
import { IgoLanguageModule, LanguageService } from '@igo2/core/language';
import { PackageInfo, PackageManagerService, QuotaService } from '@igo2/geo';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, map } from 'rxjs';

import { dynamicFormatSize } from '../utils';

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
    FormsModule,
    TranslateModule,
    IgoLanguageModule,
    IgoIconComponent
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

  private getSizeEntityTitle() {
    const size = this.languageService.translate.instant(
      'igo.integration.package-manager.size'
    );
    const MB = this.languageService.translate.instant(
      'igo.integration.package-manager.mb'
    );
    return `${size} (${MB})`;
  }

  public template: EntityTableTemplate;

  entitySortChange(): void {
    this.entitySortChange$.next(true);
  }

  get nonDownloaded() {
    return this.packageManagerService.nonDownloaded;
  }

  get nonDownloaded$() {
    return this.packageManagerService.nonDownloaded$;
  }

  get spaceLeft$() {
    return this.quotaService.quota$.pipe(
      map(({ size, usage }) => size - usage)
    );
  }

  private spaceLeft$$: Subscription;
  onSelectedPackage(entity: any | undefined) {
    this.selectedPackage = entity;
    this.spaceLeft$$?.unsubscribe();

    if (this.selectedPackage) {
      this.spaceLeft$$ = this.hasSufficientSpaceForPackage(entity).subscribe(
        (canDownload) => {
          this.canDownload = canDownload;
        }
      );
    }
  }

  getSpaceLeft() {
    return this.quotaService
      .getQuota()
      .pipe(map(({ size, usage }) => size - usage));
  }

  hasSufficientSpaceForPackage(selectedPackage: PackageInfo) {
    const packageSize = selectedPackage.size * 1000 * 1000;
    return this.getSpaceLeft().pipe(
      map((spaceLeft) => {
        return packageSize <= spaceLeft;
      })
    );
  }

  formatPackageSize(size: number) {
    return dynamicFormatSize(size * 1000 * 1000, this.languageService);
  }

  formatQuotaSize(size: number) {
    return dynamicFormatSize(size, this.languageService);
  }

  canDownload = false;

  constructor(
    private packageManagerService: PackageManagerService,
    private quotaService: QuotaService,
    private languageService: LanguageService
  ) {
    this.template = {
      selection: true,
      selectionCheckbox: true,
      // selectMany: true, TODO activate with download queue
      sort: true,
      valueAccessor: (entity: object, name: string) => {
        if (
          this.store.state.get(entity).selected &&
          this.selectedPackage !== entity
        ) {
          this.onSelectedPackage(entity);
        }

        if (
          this.selectedPackage === entity &&
          !this.store.state.get(entity).selected
        ) {
          this.onSelectedPackage(undefined);
        }

        return getEntityProperty(entity, name);
      },
      columns: [
        {
          name: 'title',
          title: this.languageService.translate.instant(
            'igo.integration.package-manager.title'
          )
        },
        {
          name: 'size',
          title: this.getSizeEntityTitle()
        }
      ]
    };
  }

  ngOnInit(): void {
    this.nonDownloaded$.subscribe((packages) => {
      const transformed = this.internalFilterPackages(packages);
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
    const filtered = this.internalFilterPackages(this.nonDownloaded);

    this.store.clear();
    this.store.load(filtered);
  }

  private internalFilterPackages(packages: PackageInfo[]) {
    return packages
      .filter(({ title }) => title.includes(this.search))
      .map((info) => this.transformPackage(info));
  }

  downloadSelectedPackage() {
    if (!this.selectedPackage) {
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
