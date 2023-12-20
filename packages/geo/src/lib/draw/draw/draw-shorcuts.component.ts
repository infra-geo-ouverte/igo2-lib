import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

@Component({
    selector: 'igo-draw-shorcuts',
    templateUrl: './draw-shorcuts.component.html',
    styleUrls: ['./draw-shorcuts.component.scss'],
    standalone: true,
    imports: [MatDialogContent, MatIconModule, MatDialogActions, MatButtonModule, MatDialogClose, TranslateModule]
})
export class DrawShorcutsComponent {}
