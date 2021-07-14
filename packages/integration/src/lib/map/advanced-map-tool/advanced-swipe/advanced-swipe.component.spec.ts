import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSwipeComponent } from './advanced-swipe.component';

describe('AdvancedSwipeComponent', () => {
  let component: AdvancedSwipeComponent;
  let fixture: ComponentFixture<AdvancedSwipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancedSwipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSwipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
