/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IgoSharedModule } from '../../shared';

import { GeolocateButtonComponent } from './geolocate-button.component';

describe('geolocateButtonComponent', () => {
  let component: GeolocateButtonComponent;
  let fixture: ComponentFixture<GeolocateButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [ GeolocateButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeolocateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
