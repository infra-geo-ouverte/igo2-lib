import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexibleComponent } from './flexible.component';

describe('FlexibleComponent', () => {
  let component: FlexibleComponent;
  let fixture: ComponentFixture<FlexibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexibleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FlexibleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
