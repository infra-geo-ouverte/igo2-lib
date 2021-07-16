import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedCoordinatesComponent } from './advanced-coordinates.component';

describe('AdvancedCoordinatesComponent', () => {
  let component: AdvancedCoordinatesComponent;
  let fixture: ComponentFixture<AdvancedCoordinatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancedCoordinatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedCoordinatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
