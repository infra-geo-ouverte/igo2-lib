import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { IconSvg, IgoIconComponent, KEYBOARD_ESC_ICON } from '@igo2/common';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'igo-draw-shorcuts',
  templateUrl: './draw-shorcuts.component.html',
  styleUrls: ['./draw-shorcuts.component.scss'],
  standalone: true,
  imports: [
    MatDialogContent,
    MatIconModule,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    TranslateModule,
    IgoIconComponent
  ]
})
export class DrawShorcutsComponent {
  svgIcon: IconSvg = KEYBOARD_ESC_ICON;
}
