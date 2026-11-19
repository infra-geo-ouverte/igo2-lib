import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { ContextMenuDirective } from './context-menu.directive';

@Component({
  imports: [ContextMenuDirective],
  template: `
    <div [igoContextMenu]="menu" (menuPosition)="onMenuPosition($event)"></div>
    <ng-template #menu><span class="menu-item">item</span></ng-template>
  `
})
class TestHostComponent {
  onMenuPosition = vi.fn();
}

describe('ContextMenuDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    element = fixture.debugElement.query(
      By.directive(ContextMenuDirective)
    ).nativeElement;
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should open the menu and emit menuPosition on contextmenu', () => {
    const domEvent = new MouseEvent('contextmenu', {
      clientX: 5,
      clientY: 6,
      cancelable: true
    });

    element.dispatchEvent(domEvent);

    expect(domEvent.defaultPrevented).toBe(true);
    expect(
      fixture.componentInstance.onMenuPosition
    ).toHaveBeenCalledExactlyOnceWith({ x: 5, y: 6 });
    expect(
      overlayContainer.getContainerElement().querySelector('.menu-item')
    ).toBeTruthy();
  });

  it('should open the menu on a touch long press (igoLongPress host directive)', () => {
    vi.useFakeTimers();
    const touchEvent = new TouchEvent('touchstart');
    Object.defineProperty(touchEvent, 'touches', {
      value: [{ pageX: 30, pageY: 40 }]
    });

    element.dispatchEvent(touchEvent);
    vi.advanceTimersByTime(400);
    vi.useRealTimers();

    expect(
      fixture.componentInstance.onMenuPosition
    ).toHaveBeenCalledExactlyOnceWith({ x: 30, y: 40 });
    expect(
      overlayContainer.getContainerElement().querySelector('.menu-item')
    ).toBeTruthy();
  });
});
