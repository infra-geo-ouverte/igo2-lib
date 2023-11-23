export interface Choice {
  id: any;
  title?: any;
}

export interface SelectValueData {
  choices: Choice[];
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  multiple?: boolean;
}
