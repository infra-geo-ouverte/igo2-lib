import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityService } from '../../../core';
import { IgoSharedModule } from '../../../shared';
import { MapBrowserComponent } from '../../../map';

import { MapFieldComponent } from './map-field.component';

describe('MapFieldComponent', () => {
  let component: MapFieldComponent;
  let fixture: ComponentFixture<MapFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
      ],
      declarations: [
        MapBrowserComponent,
        MapFieldComponent
      ],
      providers: [
        ActivityService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFieldComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
