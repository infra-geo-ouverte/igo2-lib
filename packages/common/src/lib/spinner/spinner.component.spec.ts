import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatLegacyProgressSpinner as MatProgressSpinner } from '@angular/material/legacy-progress-spinner';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MatProgressSpinner, SpinnerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
