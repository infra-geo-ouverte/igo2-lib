import { FormFieldCheckboxComponent } from './form-field-checkbox.component';
import { FormFieldDatetimeComponent } from './form-field-datetime.component';
import { FormFieldNumberComponent } from './form-field-number.component';
import { FormFieldRadiobuttonComponent } from './form-field-radiobutton.component';
import { FormFieldSelectComponent } from './form-field-select.component';
import { FormFieldTextComponent } from './form-field-text.component';
import { FormFieldTextareaComponent } from './form-field-textarea.component';
import { FormFieldComponent } from './form-field.component';

export const FORM_FIELD_DIRECTIVES = [
  FormFieldComponent,
  FormFieldCheckboxComponent,
  FormFieldDatetimeComponent,
  FormFieldNumberComponent,
  FormFieldRadiobuttonComponent,
  FormFieldSelectComponent,
  FormFieldTextComponent,
  FormFieldTextareaComponent
] as const;
