import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityService } from '@igo2/core';
import { IgoMap } from '../shared';
import { MapBrowserComponent } from './map-browser.component';

describe('MapBrowserComponent', () => {
  let component: MapBrowserComponent;
  let fixture: ComponentFixture<MapBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [MapBrowserComponent],
      providers: [ActivityService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapBrowserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.map = new IgoMap();
    component.ngAfterViewInit();
    expect(component).toBeTruthy();
  });
});
