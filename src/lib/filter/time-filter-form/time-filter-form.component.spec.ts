import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Md2Module } from 'md2';

import { IgoSharedModule } from '../../shared';

import { TimeFilterFormComponent } from './time-filter-form.component';

describe('TimeFilterFormComponent', () => {
  let component: TimeFilterFormComponent;
  let fixture: ComponentFixture<TimeFilterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        Md2Module
      ],
      declarations: [ TimeFilterFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeFilterFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test HandleDateChange with format "date" and !isRange', () => {
    component.setOptions({
        'type': 'date',
        'style': 'calendar',
        'timeinterval': 2000,
        'min': '1980-01-01T05:00:00Z',
        'max': '2020-03-29T05:00:00Z',
        'step': null
    });
    component.date = '1999-02-02T15:00:00-0400';
    const dateAfterHandle = '1999-02-02T00:00:00-0400';
    component.handleDateChange({});
    expect(component.date.toISOString()).toBe(dateAfterHandle.toISOString());
  });
});
