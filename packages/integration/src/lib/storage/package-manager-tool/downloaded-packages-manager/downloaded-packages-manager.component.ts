import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  EntityStore,
  EntityTableColumnRenderer,
  EntityTableComponent,
  EntityTableTemplate,
  getEntityProperty
} from '@igo2/common/entity';
import { LanguageService } from '@igo2/core/language';
import {
  DevicePackageInfo,
  N_DAY_PACKAGE_SOON_TO_EXPIRE,
  PackageManagerActionType,
  PackageManagerService,
  QuotaService
} from '@igo2/geo';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, map } from 'rxjs';

import { dynamicFormatSize } from '../utils';
import { PackageProgressStatusComponent } from './package-progress-status/package-progress-status.component';

@Component({
  selector: 'igo-downloaded-packages-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    EntityTableComponent,
    PackageProgressStatusComponent,
    TranslateModule
  ],
  templateUrl: './downloaded-packages-manager.component.html',
  styleUrls: ['./downloaded-packages-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadedPackagesManagerComponent implements OnInit {
  @ViewChild('entityTable') entityTable: EntityTableComponent;

  private datePipe = new DatePipe('en-US');
  public store: EntityStore = new EntityStore([]);
  public entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  selectedPackage = undefined;

  public template: EntityTableTemplate;

  entitySortChange(): void {
    this.entitySortChange$.next(true);
  }

  get downloaded() {
    return this.packageManager.downloaded;
  }

  get downloaded$() {
    return this.packageManager.downloaded$;
  }

  get action() {
    return this.packageManager.action;
  }

  get action$() {
    return this.packageManager.action$;
  }

  get quota$() {
    return this.quotaService.quota$.pipe(
      map(({ usage, size }) => {
        return `${dynamicFormatSize(usage, this.languageService)} / ${dynamicFormatSize(size, this.languageService)}`;
      })
    );
  }

  private getSizeEntityTitle() {
    const size = this.languageService.translate.instant(
      'igo.integration.package-manager.size'
    );
    const MB = this.languageService.translate.instant(
      'igo.integration.package-manager.mb'
    );
    return `${size} (${MB})`;
  }

  constructor(
    private packageManager: PackageManagerService,
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
          title: this.languageService.translate.instant(
            'igo.integration.package-manager.title'
          )
        },
        {
          name: 'size',
          title: this.getSizeEntityTitle()
        },
        {
          name: 'expiration',
          title: this.languageService.translate.instant(
            'igo.integration.package-manager.expiration'
          ),
          renderer: EntityTableColumnRenderer.HTML
        }
      ]
    };
  }

  ngOnInit(): void {
    this.downloaded$.subscribe((downloaded) => {
      const transformed = downloaded.map((p) => this.formatPackage(p));
      this.store.clear();
      this.store.load(transformed);
    });

    this.action$.subscribe((action) => {
      this.setSelection(!action);
    });
  }

  private setSelection(value: boolean) {
    this.template.selection = value;
    this.template.selectionCheckbox = value;
    this.entityTable?.refresh();
  }

  private formatPackage(downloaded: DevicePackageInfo) {
    const { size, expiration, ...other } = downloaded;
    const sizeInMB = (size / (1000 * 1000)).toFixed(1);
    const expirationHTML = this.getExpirationHTML(downloaded);
    return {
      ...other,
      expiration: expirationHTML,
      size: sizeInMB
    };
  }

  private getExpirationHTML(downloaded: DevicePackageInfo) {
    const getCSSClass = (expiration: Date) => {
      const now = new Date();
      const soonToExpire = new Date(
        now.getTime() + N_DAY_PACKAGE_SOON_TO_EXPIRE * 24 * 60 * 60 * 1000
      );

      if (now >= expiration) {
        return 'expired';
      }

      return soonToExpire >= expiration ? 'expiring-soon' : 'ok';
    };

    const { expiration } = downloaded;
    const formatedExp = this.datePipe.transform(expiration, 'dd-MM-YYYY');

    const cssClass = getCSSClass(expiration);
    return `<div class="${cssClass}">${formatedExp}</div>`;
  }

  isActionCancelable() {
    return this.action$.pipe(
      map((action) => {
        if (!action) {
          return false;
        }
        return (
          action.type === PackageManagerActionType.DOWNLOADING ||
          action.type === PackageManagerActionType.INSTALLING
        );
      })
    );
  }

  deleteSelectedPackage() {
    if (!this.selectedPackage) {
      return;
    }
    this.packageManager.deletePackage(this.selectedPackage);
  }

  cancelAction() {
    this.packageManager.cancelAction();
  }
}
