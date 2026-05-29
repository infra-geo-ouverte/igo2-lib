import { registerLocaleData } from '@angular/common';
import localeEnCa from '@angular/common/locales/en-CA';
import localeFrCa from '@angular/common/locales/fr-CA';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { DatepickerComponent } from '@igo2/common/datepicker';

import { provideTranslateService } from '@ngx-translate/core';

import { FormFieldDateComponent } from './form-field-date.component';

describe('FormFieldDateComponent', () => {
  let component: FormFieldDateComponent;
  let fixture: ComponentFixture<FormFieldDateComponent>;
  let formControl: UntypedFormControl;

  function getDatepicker(): DatepickerComponent {
    return fixture.debugElement.query(By.directive(DatepickerComponent))
      .componentInstance as DatepickerComponent;
  }

  beforeEach(async () => {
    registerLocaleData(localeFrCa);
    registerLocaleData(localeEnCa);

    await TestBed.configureTestingModule({
      imports: [FormFieldDateComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'fr-CA' },
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldDateComponent);
    component = fixture.componentInstance;
    formControl = new UntypedFormControl();

    fixture.componentRef.setInput('formControl', formControl);
    fixture.detectChanges();
  });

  it('should sync a timestamp written after init into the inner datepicker', () => {
    const timestamp = Date.UTC(2026, 4, 29, 12, 0, 0);

    formControl.setValue(timestamp);
    fixture.detectChanges();

    const datepicker = getDatepicker();

    expect(datepicker.dateFormControl.value?.getTime()).toBe(timestamp);
    expect(datepicker.dateLabelFormControl.value).toBe('2026-05-29');
  });

  it('should emit a yyyy-MM-dd string when calendarType is date', () => {
    const selectedDate = new Date(2026, 4, 28, 0, 0, 0);

    getDatepicker().valueChange.emit(selectedDate);
    fixture.detectChanges();

    expect(formControl.value).toBe('2026-05-28');
  });

  it('should emit a yyyy-MM string when calendarType is month', () => {
    fixture.componentRef.setInput('calendarType', 'month');
    fixture.detectChanges();

    const selectedDate = new Date(2026, 4, 1, 0, 0, 0);
    getDatepicker().valueChange.emit(selectedDate);
    fixture.detectChanges();

    expect(formControl.value).toBe('2026-05');
  });

  it('should emit a yyyy string when calendarType is year', () => {
    fixture.componentRef.setInput('calendarType', 'year');
    fixture.detectChanges();

    const selectedDate = new Date(2026, 0, 1, 0, 0, 0);
    getDatepicker().valueChange.emit(selectedDate);
    fixture.detectChanges();

    expect(formControl.value).toBe('2026');
  });

  it('should rehydrate a yyyy-MM-dd string into the inner datepicker', () => {
    formControl.setValue('2026-05-28');
    fixture.detectChanges();

    const datepicker = getDatepicker();

    expect(datepicker.dateFormControl.value?.getFullYear()).toBe(2026);
    expect(datepicker.dateFormControl.value?.getMonth()).toBe(4);
    expect(datepicker.dateFormControl.value?.getDate()).toBe(28);
    expect(datepicker.dateLabelFormControl.value).toBe('2026-05-28');
  });

  it('should clear the inner datepicker when the form control is reset', () => {
    formControl.setValue(new Date(Date.UTC(2026, 4, 29, 12, 0, 0)));
    fixture.detectChanges();

    formControl.reset();
    fixture.detectChanges();

    const datepicker = getDatepicker();

    expect(datepicker.dateFormControl.value).toBeNull();
    expect(datepicker.dateLabelFormControl.value).toBeNull();
  });

  it('should sync disabled state changes to the inner datepicker after init', () => {
    formControl.disable();
    fixture.detectChanges();

    let datepicker = getDatepicker();

    expect(component.disabled()).toBe(true);
    expect(datepicker.disabled).toBe(true);
    expect(datepicker.dateFormControl.disabled).toBe(true);
    expect(datepicker.dateLabelFormControl.disabled).toBe(true);

    formControl.enable();
    fixture.detectChanges();

    datepicker = getDatepicker();

    expect(component.disabled()).toBe(false);
    expect(datepicker.disabled).toBe(false);
    expect(datepicker.dateFormControl.disabled).toBe(false);
    expect(datepicker.dateLabelFormControl.disabled).toBe(false);
  });
});
