import { SelectValueDialogType } from './select-value-dialog.enums';

export interface Choice {
  value: any;
  title: any;
}

export interface SelectValueData extends SelectValueDialogOptions {
  choices: Choice[];
}

export interface SelectValueDialogOptions {
  type?: SelectValueDialogType;
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  selectFieldText?: string;
}
