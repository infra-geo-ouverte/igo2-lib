import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDatepickerModule } from '@angular/material';

import { IgoSharedModule } from '../../shared';

import { WMSDataSource } from '../../datasource';

import { TimeFilterItemComponent } from './time-filter-item.component';
import { TimeFilterFormComponent } from '../time-filter-form';

describe('TimeFilterItemComponent', () => {
  let component: TimeFilterItemComponent;
  let fixture: ComponentFixture<TimeFilterItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        MatDatepickerModule
      ],
      declarations: [
        TimeFilterItemComponent,
        TimeFilterFormComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeFilterItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const dataSource = new WMSDataSource({
      title: 'WMS',
      url: 'foo',
      projection: 'EPSG:3857',
      params: {
        layers: 'bar'
      },
      timeFilter: {}
    });
    component.datasource = dataSource;
    expect(component).toBeTruthy();
  });
});
