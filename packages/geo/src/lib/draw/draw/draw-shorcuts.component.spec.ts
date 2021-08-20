import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawShorcutsComponent } from './draw-shorcuts.component';

describe('DrawShorcutsComponent', () => {
  let component: DrawShorcutsComponent;
  let fixture: ComponentFixture<DrawShorcutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawShorcutsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawShorcutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
