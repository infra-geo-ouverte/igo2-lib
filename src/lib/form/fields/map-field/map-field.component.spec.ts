import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';

import { MapFieldComponent } from './map-field.component';

describe('MapFieldComponent', () => {
  let component: MapFieldComponent;
  let fixture: ComponentFixture<MapFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
      ],
      declarations: [ MapFieldComponent ]
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
