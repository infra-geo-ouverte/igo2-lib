import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';

import { IgoSharedModule } from '../../shared';

import { FilterableDataSourcePipe } from '../shared';
import { TimeFilterItemComponent } from '../time-filter-item';
import { TimeFilterFormComponent } from '../time-filter-form';
import { TimeFilterListComponent } from './time-filter-list.component';

describe('TimeFilterListComponent', () => {
  let component: TimeFilterListComponent;
  let fixture: ComponentFixture<TimeFilterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDatetimepickerModule,
        MatNativeDatetimeModule
      ],
      declarations: [
        FilterableDataSourcePipe,
        TimeFilterListComponent,
        TimeFilterItemComponent,
        TimeFilterFormComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeFilterListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.datasources = [];
    expect(component).toBeTruthy();
  });
});
