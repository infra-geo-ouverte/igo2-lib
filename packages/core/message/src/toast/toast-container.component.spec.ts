import { TestBed } from '@angular/core/testing';

import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders without errors', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
