import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'igo-package-management-tool',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './package-management-tool.component.html',
  styleUrls: ['./package-management-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageManagementToolComponent { }
