import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'packageManager',
  title: 'Download regions', // TODO change to igo.integration.tools.packageManager
  icon: 'cloud-download'
})
@Component({
  selector: 'igo-package-manager-tool',
  templateUrl: './package-manager-tool.component.html',
  styleUrls: ['./package-manager-tool.component.scss']
})
export class PackageManagerToolComponent {}
