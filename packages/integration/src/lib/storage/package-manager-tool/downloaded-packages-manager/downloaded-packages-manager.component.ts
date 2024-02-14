import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { PackageManagerService } from '@igo2/geo';

@Component({
  selector: 'igo-downloaded-packages-manager',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './downloaded-packages-manager.component.html',
  styleUrls: ['./downloaded-packages-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadedPackagesManagerComponent {
  constructor(private packageManager: PackageManagerService) {}

  deleteSelectedPackage() {
    console.log('Deleting package');
    // if (!this.selectedPackage) {
    //   return;
    // }
    // const downloaded = {
    //   ...this.selectedPackage,
    //   totalFiles: 10
    // };
    // this.packageManagerService.deletePackage(downloaded);
  }
}
