import { MatDialogConfig } from '@angular/material/dialog';

export interface ConfirmDialogOptions extends MatDialogConfig {
  title?: string;
  modeYesNo?: boolean;
}
