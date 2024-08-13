import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ToolComponent } from '@igo2/common/tool';
import { PackageManagerService } from '@igo2/geo';

import { TranslateModule } from '@ngx-translate/core';

import { DownloadPackageComponent } from './download-package';
import { DownloadedPackagesManagerComponent } from './downloaded-packages-manager';

@ToolComponent({
  name: 'packageManager',
  title: 'igo.integration.tools.packageManager',
  icon: 'deployed_code_update'
})
@Component({
  selector: 'igo-package-manager-tool',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    DownloadedPackagesManagerComponent,
    DownloadPackageComponent,
    TranslateModule
  ],
  templateUrl: './package-manager-tool.component.html',
  styleUrls: ['./package-manager-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageManagerToolComponent implements OnInit {
  selectedPackage = undefined;
  selectedTab: number = 0;

  get packages() {
    return this.packageManagerService.packages;
  }

  get packages$() {
    return this.packageManagerService.packages$;
  }

  constructor(private packageManagerService: PackageManagerService) {}

  ngOnInit(): void {
    this.packageManagerService.notifyExpirations();
    this.selectedTab = !this.packageManagerService.downloaded.length ? 0 : 1;
  }

  deleteSelectedPackage() {
    if (!this.selectedPackage) {
      return;
    }

    this.packageManagerService.deletePackage(this.selectedPackage);
  }

  onDownload() {
    this.selectedTab = 1;
  }
}
