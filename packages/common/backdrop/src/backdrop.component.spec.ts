import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/common/test-config';

import { BackdropComponent } from './backdrop.component';

describe('BackdropComponent', () => {
  let component: BackdropComponent;
  let fixture: ComponentFixture<BackdropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [BackdropComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(BackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
