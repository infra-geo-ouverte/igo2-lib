import { registerLocaleData } from '@angular/common';
import localeEnCa from '@angular/common/locales/en-CA';
import localeFrCa from '@angular/common/locales/fr-CA';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TimepickerComponent } from '@igo2/common/timepicker';
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

  it('should parse a date-only string as a local date in datetime mode', () => {
    fixture.componentRef.setInput('calendarType', 'datetime');
    fixture.componentRef.setInput('value', '2026-05-29');
    fixture.detectChanges();

    expect(component.dateFormControl.value?.getFullYear()).toBe(2026);
    expect(component.dateFormControl.value?.getMonth()).toBe(4);
    expect(component.dateFormControl.value?.getDate()).toBe(29);
  });

  it('should clear the timepicker when datetime value becomes undefined', () => {
    fixture.componentRef.setInput('calendarType', 'datetime');
    fixture.componentRef.setInput('value', new Date(2026, 4, 29, 14, 30));
    fixture.detectChanges();

    fixture.componentRef.setInput('value', undefined);
    fixture.detectChanges();

    const timepicker = fixture.debugElement.query(
      By.directive(TimepickerComponent)
    ).componentInstance as TimepickerComponent;

    expect(timepicker.hourFormControl.value).toBe(0);
    expect(timepicker.minuteFormControl.value).toBe(0);
  });

  it('should let datetime mode update hours and minutes through the timepicker', () => {
    const emittedValues: Array<Date | TimeFrame | undefined> = [];
    const testDate = new Date(2026, 4, 29, 14, 30);

    fixture.componentRef.setInput('calendarType', 'datetime');
    fixture.componentRef.setInput('value', testDate);
    fixture.detectChanges();

    component.valueChange.subscribe((value) => emittedValues.push(value));

    const timepicker = fixture.debugElement.query(
      By.directive(TimepickerComponent)
    ).componentInstance as TimepickerComponent;

    timepicker.valueChange.emit({ hour: 9, minute: 45 });
    fixture.detectChanges();

    expect(component.dateFormControl.value?.getHours()).toBe(9);
    expect(component.dateFormControl.value?.getMinutes()).toBe(45);

    const lastEmittedValue = emittedValues.at(-1);
    expect(lastEmittedValue).toBeInstanceOf(Date);
    expect((lastEmittedValue as Date).getHours()).toBe(9);
    expect((lastEmittedValue as Date).getMinutes()).toBe(45);
  });
});
