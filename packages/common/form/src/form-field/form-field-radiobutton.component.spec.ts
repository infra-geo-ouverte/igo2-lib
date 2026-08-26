import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';

import { provideTranslateService } from '@ngx-translate/core';

import '../../../src/test';
import { FormFieldService } from '../shared/form-field.service';
import { FormFieldRadiobuttonComponent } from './form-field-radiobutton.component';

type RadiobuttonComponentInputs = {
  formControl: () => UntypedFormControl;
  choices: () => { value: string; title: string }[];
};

describe('FormFieldRadiobuttonComponent', () => {
  let component: FormFieldRadiobuttonComponent;
  let fixture: ComponentFixture<FormFieldRadiobuttonComponent>;
  let formControl: UntypedFormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldRadiobuttonComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldRadiobuttonComponent);
    component = fixture.componentInstance;
    formControl = new UntypedFormControl('alpha');

    const componentInputs = component as unknown as RadiobuttonComponentInputs;
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

  it('should register both radiobutton aliases', () => {
    const formFieldService = TestBed.inject(FormFieldService);

    expect(formFieldService.getFieldByType('radiobutton')).toBe(
      FormFieldRadiobuttonComponent
    );
    expect(formFieldService.getFieldByType('radiobuttons')).toBe(
      FormFieldRadiobuttonComponent
    );
  });

  it('should keep the current single selected value', () => {
    expect(formControl.value).toBe('alpha');

    formControl.setValue('beta');
    fixture.detectChanges();

    expect(formControl.value).toBe('beta');
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

  it('should clear the selected radiobutton when the form control is reset', async () => {
    let inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);

    formControl.reset();
    await fixture.whenStable();
    fixture.detectChanges();

    inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
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
