import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVectorDataStylingComponent } from './vector-data-styling.component';

describe('VectorDataStylingComponent', () => {
  let component: AppVectorDataStylingComponent;
  let fixture: ComponentFixture<AppVectorDataStylingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppVectorDataStylingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppVectorDataStylingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
