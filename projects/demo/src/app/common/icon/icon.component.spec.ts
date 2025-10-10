import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { mergeTestConfig } from 'projects/demo/src/test-config';

import { AppIconComponent } from './icon.component';

describe('AppIconComponent', () => {
  let component: AppIconComponent;
  let fixture: ComponentFixture<AppIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [AppIconComponent, NoopAnimationsModule]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(AppIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
