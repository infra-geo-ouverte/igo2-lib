import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { provideTranslateService } from '@ngx-translate/core';

import '../../../src/test';
import { FormFieldService } from '../shared/form-field.service';
import { FormFieldCheckboxComponent } from './form-field-checkbox.component';

type CheckboxComponentInputs = {
  formControl: () => UntypedFormControl;
  choices: () => { value: string; title: string }[];
};

describe('FormFieldCheckboxComponent', () => {
  let component: FormFieldCheckboxComponent;
  let fixture: ComponentFixture<FormFieldCheckboxComponent>;
  let formControl: UntypedFormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldCheckboxComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldCheckboxComponent);
    component = fixture.componentInstance;
    formControl = new UntypedFormControl('');

    const componentInputs = component as unknown as CheckboxComponentInputs;
    componentInputs.formControl = () => formControl;
    componentInputs.choices = () => [
      { value: 'alpha', title: 'Alpha' },
      { value: 'beta', title: 'Beta' }
    ];
    fixture.detectChanges();
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
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('mat-error');

    expect(errorElement.hidden).toBe(true);
    expect(getComputedStyle(errorElement).display).toBe('none');
  });

  it('should show an error after the control is touched', () => {
    formControl.setErrors({ required: true });
    formControl.markAsTouched();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('mat-error');

    expect(errorElement.hidden).toBe(false);
    expect(getComputedStyle(errorElement).display).not.toBe('none');
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
    fixture.detectChanges();

    let inputs = fixture.nativeElement.querySelectorAll(
      'input[type="checkbox"]'
    );
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(true);

    formControl.reset();
    await fixture.whenStable();
    fixture.detectChanges();

    inputs = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    expect(formControl.value).toBeNull();
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(false);
  });

  it('should toggle form control disabled state with disable switch handler', () => {
    expect(formControl.disabled).toBe(false);

    component.onDisableSwitchClick();
    fixture.detectChanges();

    expect(formControl.disabled).toBe(true);
    expect(component.disabled()).toBe(true);

    component.onDisableSwitchClick();
    fixture.detectChanges();

    expect(formControl.disabled).toBe(false);
    expect(component.disabled()).toBe(false);
  });
});
