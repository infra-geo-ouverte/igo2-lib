export interface Choice {
  value: any;
  title: any;
}

export interface SelectValueData {
  choices: Choice[];
  title?: string;
  selectFieldText?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  multiple?: boolean;
}
