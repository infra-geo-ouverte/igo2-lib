import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBrowserComponent } from '../../../map';

import { MapFieldComponent } from './map-field.component';

describe('MapFieldComponent', () => {
  let component: MapFieldComponent;
  let fixture: ComponentFixture<MapFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [MapBrowserComponent, MapFieldComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFieldComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
