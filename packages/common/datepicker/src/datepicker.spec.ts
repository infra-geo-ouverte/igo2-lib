import { registerLocaleData } from '@angular/common';
import localeEnCa from '@angular/common/locales/en-CA';
import localeFrCa from '@angular/common/locales/fr-CA';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeFrame } from '@igo2/utils';

import { DatepickerComponent } from './datepicker.component';

describe('DatepickerComponent', () => {
  let component: DatepickerComponent;
  let fixture: ComponentFixture<DatepickerComponent>;

  beforeEach(async () => {
    registerLocaleData(localeFrCa);
    registerLocaleData(localeEnCa);

    await TestBed.configureTestingModule({
      imports: [DatepickerComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-CA' }]
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should default to today's date if no value or minDate is provided", () => {
    const testDate = new Date();
    const expected = component['format'](testDate, 'shortDate');
    expect(component.dateLabelFormControl.value).toBe(expected);
  });

  it('should default startView to "multi-year" when calendarType is "year" and startView is not set', () => {
    fixture.componentRef.setInput('calendarType', 'year');
    fixture.componentRef.setInput('startView', undefined);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.startView()).toBe('multi-year');
    expect(component.dateLabelFormControl.value).toBe(
      new Date().getFullYear().toString()
    );
  });

  it('should format date as yyyy-MM when calendarType is "month"', () => {
    const testDate = new Date(2025, 11, 1);
    fixture.componentRef.setInput('calendarType', 'month');
    fixture.componentRef.setInput('startView', undefined);
    fixture.componentRef.setInput('value', testDate);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.dateLabelFormControl.value).toBe('2025-12');
  });

  it('should format date as yyy-MM-dd when calendarType is "date"', () => {
    const testDate = new Date(2025, 11, 1);
    fixture.componentRef.setInput('calendarType', 'date');
    fixture.componentRef.setInput('startView', undefined);
    fixture.componentRef.setInput('value', testDate);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.dateLabelFormControl.value).toBe('2025-12-01');
  });

  it('should display "Today/Now" when the value is DateKeyword', () => {
    const testDate = TimeFrame[1];
    fixture.componentRef.setInput('calendarType', 'date');
    fixture.componentRef.setInput('value', testDate);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.dateLabelFormControl.value).toBe('Today');
  });

  it('should update internal controls when value input changes after init', () => {
    const testDate = new Date(2026, 4, 29);

    fixture.componentRef.setInput('value', testDate);
    fixture.detectChanges();

    expect(component.dateFormControl.value?.getTime()).toBe(testDate.getTime());
    expect(component.dateLabelFormControl.value).toBe('2026-05-29');
  });

  it('should clear internal controls when value input becomes undefined', () => {
    fixture.componentRef.setInput('value', new Date(2026, 4, 29));
    fixture.detectChanges();

    fixture.componentRef.setInput('value', undefined);
    fixture.detectChanges();

    expect(component.dateFormControl.value).toBeNull();
    expect(component.dateLabelFormControl.value).toBeNull();
  });
});
