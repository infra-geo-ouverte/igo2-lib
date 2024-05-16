import { FormFieldService } from './form-field.service';

export function IgoFormFieldComponent(type: string): (cls: any) => any {
  return (compType: any) => {
    FormFieldService.register(type, compType);
  };
}
