import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Md2Module } from 'md2';

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
        Md2Module
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
