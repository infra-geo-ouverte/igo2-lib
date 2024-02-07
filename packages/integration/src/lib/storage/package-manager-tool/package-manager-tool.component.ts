import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'packageManager',
  title: 'igo.integration.tools.dataIssueReporter',
  icon: 'message-alert'
})
@Component({
  selector: 'igo-package-manager-tool',
  templateUrl: './package-manager-tool.component.html',
  styleUrls: ['./package-manager-tool.component.scss']
})
export class PackageManagerToolComponent {}
