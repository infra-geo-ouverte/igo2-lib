import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Md2Module } from 'md2';

import { IgoSharedModule } from '../../shared';

import { WMSLayer } from '../../layer';

import { TimeFilterItemComponent } from './time-filter-item.component';
import { TimeFilterFormComponent } from '../time-filter-form';

describe('TimeFilterItemComponent', () => {
  let component: TimeFilterItemComponent;
  let fixture: ComponentFixture<TimeFilterItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        Md2Module
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
    const layer = new WMSLayer({
      title: 'WMS',
      type: 'wms',
      source: {
        url: 'foo',
        projection: 'EPSG:3857',
        params: {
          layers: 'bar'
        }
      },
      timeFilter: {}
    });
    component.layer = layer;
    expect(component).toBeTruthy();
  });
});
