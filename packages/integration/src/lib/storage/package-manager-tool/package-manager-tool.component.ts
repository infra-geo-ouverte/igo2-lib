import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IgoFormModule, ToolComponent } from '@igo2/common';

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
export class PackageManagerToolComponent {}
