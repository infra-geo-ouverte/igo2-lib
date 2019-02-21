import { FormFieldService } from './form-field.service';

export function FormFieldComponent(type: string): (cls: any) => any {
  return (compType: any) => {
    FormFieldService.register(type, compType);
  };
}
