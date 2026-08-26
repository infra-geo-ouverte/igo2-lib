import { TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';

import { provideTranslateService } from '@ngx-translate/core';

import { FormFieldService } from '../shared/form-field.service';
import { FormFieldCheckboxComponent } from './form-field-checkbox.component';

type CheckboxComponentInputs = {
  formControl: () => UntypedFormControl;
  choices: () => { value: string; title: string }[];
  maxSelected?: () => number | undefined;
};

describe('FormFieldCheckboxComponent', () => {
  let component: FormFieldCheckboxComponent;
  let formControl: UntypedFormControl;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), ErrorStateMatcher]
    });

    formControl = new UntypedFormControl('');

    component = TestBed.runInInjectionContext(
      () => new FormFieldCheckboxComponent()
    );

    const componentInputs = component as unknown as CheckboxComponentInputs;
    componentInputs.formControl = () => formControl;
    componentInputs.choices = () => [
      { value: 'alpha', title: 'Alpha' },
      { value: 'beta', title: 'Beta' }
    ];
    componentInputs.maxSelected = () => undefined;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register checkbox type', () => {
    const formFieldService = TestBed.inject(FormFieldService);

    expect(formFieldService.getFieldByType('checkbox')).toBe(
      FormFieldCheckboxComponent
    );
  });

  it('should normalize empty values into an array', () => {
    expect(formControl.value).toEqual([]);
  });

  it('should not show an error before the control is touched', () => {
    formControl.setErrors({ required: true });

    (component as any).syncState(formControl);

    expect(component.showError()).toBe(false);
  });

  it('should show an error after the control is touched', () => {
    formControl.setErrors({ required: true });
    formControl.markAsTouched();

    (component as any).syncState(formControl);

    expect(component.showError()).toBe(true);
  });

  it('should add and remove selected values', () => {
    component.onChoiceChange('alpha', { checked: true } as MatCheckboxChange);

    expect(formControl.value).toEqual(['alpha']);

    component.onChoiceChange('beta', { checked: true } as MatCheckboxChange);

    expect(formControl.value).toEqual(['alpha', 'beta']);

    component.onChoiceChange('alpha', { checked: false } as MatCheckboxChange);

    expect(formControl.value).toEqual(['beta']);
  });

  it('should clear selected checkboxes when the form control is reset', async () => {
    component.onChoiceChange('alpha', { checked: true } as MatCheckboxChange);
    component.onChoiceChange('beta', { checked: true } as MatCheckboxChange);

    expect(component.isChecked('alpha')).toBe(true);
    expect(component.isChecked('beta')).toBe(true);

    formControl.reset();
    (component as any).syncState(formControl);

    expect(formControl.value).toBeNull();
    expect(component.isChecked('alpha')).toBe(false);
    expect(component.isChecked('beta')).toBe(false);
  });

  it('should toggle form control disabled state with disable switch handler', () => {
    expect(formControl.disabled).toBe(false);

    component.onDisableSwitchClick();

    expect(formControl.disabled).toBe(true);
    expect(component.disabled()).toBe(true);

    component.onDisableSwitchClick();

    expect(formControl.disabled).toBe(false);
    expect(component.disabled()).toBe(false);
  });

  it('should invalidate the control when more than the max selected values are checked', () => {
    const componentInputs = component as unknown as CheckboxComponentInputs;
    componentInputs.maxSelected = () => 1;

    component.ngOnInit();

    component.onChoiceChange('alpha', { checked: true } as MatCheckboxChange);
    component.onChoiceChange('beta', { checked: true } as MatCheckboxChange);

    expect(formControl.errors).toEqual({
      maxSelected: {
        max: 1,
        actual: 2
      }
    });
    expect(component.getErrorMessage()).toBe('Select at most 1 options.');
  });

  it('should clear the maxSelected error when the selection returns within range', () => {
    const componentInputs = component as unknown as CheckboxComponentInputs;
    componentInputs.maxSelected = () => 1;

    component.ngOnInit();

    component.onChoiceChange('alpha', { checked: true } as MatCheckboxChange);
    component.onChoiceChange('beta', { checked: true } as MatCheckboxChange);
    component.onChoiceChange('beta', { checked: false } as MatCheckboxChange);

    expect(formControl.errors).toBeNull();
  });
});
