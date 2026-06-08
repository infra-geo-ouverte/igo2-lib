import { registerLocaleData } from '@angular/common';
import localeEnCa from '@angular/common/locales/en-CA';
import localeFrCa from '@angular/common/locales/fr-CA';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';

import { provideTranslateService } from '@ngx-translate/core';

import { FormFieldDatetimeComponent } from './form-field-datetime.component';

describe('FormFieldDatetimeComponent', () => {
  let component: FormFieldDatetimeComponent;
  let fixture: ComponentFixture<FormFieldDatetimeComponent>;
  let formControl: UntypedFormControl;

  beforeEach(async () => {
    registerLocaleData(localeFrCa);
    registerLocaleData(localeEnCa);

    await TestBed.configureTestingModule({
      imports: [FormFieldDatetimeComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'fr-CA' },
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldDatetimeComponent);
    component = fixture.componentInstance;
    formControl = new UntypedFormControl();

    fixture.componentRef.setInput('formControl', formControl);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync initial external Date value into date and time controls', () => {
    const initial = new Date(2026, 4, 29, 16, 42, 0, 0);

    formControl.setValue(initial);
    fixture.detectChanges();

    expect(component.dateControl.value).toBeInstanceOf(Date);
    expect(component.timeControl.value).toBeInstanceOf(Date);

    expect(component.dateControl.value?.getFullYear()).toBe(2026);
    expect(component.dateControl.value?.getMonth()).toBe(4);
    expect(component.dateControl.value?.getDate()).toBe(29);

    expect(component.timeControl.value?.getHours()).toBe(16);
    expect(component.timeControl.value?.getMinutes()).toBe(42);
  });

  it('should combine date and time controls into external Date value', () => {
    component.dateControl.setValue(new Date(2026, 4, 29, 0, 0, 0, 0));
    component.timeControl.setValue(new Date(2026, 0, 1, 9, 15, 0, 0));
    fixture.detectChanges();

    expect(formControl.value).toBeInstanceOf(Date);
    expect(formControl.value.getFullYear()).toBe(2026);
    expect(formControl.value.getMonth()).toBe(4);
    expect(formControl.value.getDate()).toBe(29);
    expect(formControl.value.getHours()).toBe(9);
    expect(formControl.value.getMinutes()).toBe(15);
  });

  it('should sync disabled state to internal controls', () => {
    formControl.disable();
    fixture.detectChanges();

    expect(component.disabled()).toBe(true);
    expect(component.dateControl.disabled).toBe(true);
    expect(component.timeControl.disabled).toBe(true);

    formControl.enable();
    fixture.detectChanges();

    expect(component.disabled()).toBe(false);
    expect(component.dateControl.disabled).toBe(false);
    expect(component.timeControl.disabled).toBe(false);
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
