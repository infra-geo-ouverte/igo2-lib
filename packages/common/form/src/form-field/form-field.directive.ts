import { FormFieldSelectComponent } from './form-field-select.component';
import { FormFieldTextComponent } from './form-field-text.component';
import { FormFieldTextareaComponent } from './form-field-textarea.component';
import { FormFieldComponent } from './form-field.component';

export const FORM_FIELD_DIRECTIVES = [
  FormFieldComponent,
  FormFieldSelectComponent,
  FormFieldTextComponent,
  FormFieldTextareaComponent
] as const;
