import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCenterComponent } from './map-center.component';

describe('MapCenterComponent', () => {
  let component: MapCenterComponent;
  let fixture: ComponentFixture<MapCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapCenterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
