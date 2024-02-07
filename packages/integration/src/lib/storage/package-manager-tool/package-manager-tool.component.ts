import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Form } from '@angular/forms';

import { IgoFormModule, ToolComponent } from '@igo2/common';
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
  imports: [CommonModule, IgoFormModule],
  templateUrl: './package-manager-tool.component.html',
  styleUrls: ['./package-manager-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageManagerToolComponent {
  form$ = new BehaviorSubject<Form>(undefined);

  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);

  constructor(private packageManagerService: PackageManagerService) {}

  onSubmit(data: PackageSelectionData): void {
    console.log('onSubmit');
  }
}
