import { DatePipe } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TimeFrame } from '@igo2/utils';

import { mergeTestConfig } from 'packages/common/test-config';

import { TimepickerComponent } from './timepicker.component';

describe('TimepickerComponent', () => {
  let component: TimepickerComponent;
  let fixture: ComponentFixture<TimepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [
          TimepickerComponent,
          BrowserAnimationsModule,
          FormsModule,
          MatFormFieldModule,
          ReactiveFormsModule,
          MatSelectModule
        ],
        providers: [DatePipe, Renderer2]
      })
    ).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should default to today's time if no value is provided", () => {
    const testDate = new Date();
    expect(component.hourFormControl.value).toBe(testDate.getHours());
    expect(component.minuteFormControl.value).toBe(testDate.getMinutes());
  });

  it('should take time value if value is provided', () => {
    const testDate = new Date('2025-05-14T15:30:00');
    fixture.componentRef.setInput('value', testDate);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.hourFormControl.value).toBe(testDate.getHours());
    expect(component.minuteFormControl.value).toBe(testDate.getMinutes());
  });

  it('should take time now if value is DateKeyword', () => {
    const testDate = new Date();
    fixture.componentRef.setInput('value', TimeFrame[1]);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.hourFormControl.value).toBe(testDate.getHours());
    expect(component.minuteFormControl.value).toBe(testDate.getMinutes());
  });
});
