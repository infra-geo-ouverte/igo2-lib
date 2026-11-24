import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { LongPressDirective } from './long-press.directive';

function createTouchEvent(type: string, touchCount = 1): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', {
    value: Array.from({ length: touchCount }, () => ({ pageX: 10, pageY: 20 }))
  });
  return event;
}

@Component({
  imports: [LongPressDirective],
  template: `<div igoLongPress (longpress)="onLongPress($event)"></div>`
})
class TestHostComponent {
  onLongPress = vi.fn();
}

describe('LongPressDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    element = fixture.debugElement.query(
      By.directive(LongPressDirective)
    ).nativeElement;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should emit the longpress output after the touch duration', () => {
    const touchstart = createTouchEvent('touchstart');

    element.dispatchEvent(touchstart);
    vi.advanceTimersByTime(400);

    expect(
      fixture.componentInstance.onLongPress
    ).toHaveBeenCalledExactlyOnceWith(touchstart);
  });

  it('should not trigger before the touch duration elapsed', () => {
    element.dispatchEvent(createTouchEvent('touchstart'));
    vi.advanceTimersByTime(399);

    expect(fixture.componentInstance.onLongPress).not.toHaveBeenCalled();
  });

  it('should cancel the long press on touchend', () => {
    element.dispatchEvent(createTouchEvent('touchstart'));
    element.dispatchEvent(createTouchEvent('touchend'));
    vi.advanceTimersByTime(400);

    expect(fixture.componentInstance.onLongPress).not.toHaveBeenCalled();
  });

  it('should cancel the long press on touchmove', () => {
    element.dispatchEvent(createTouchEvent('touchstart'));
    element.dispatchEvent(createTouchEvent('touchmove'));
    vi.advanceTimersByTime(400);

    expect(fixture.componentInstance.onLongPress).not.toHaveBeenCalled();
  });

  it('should not trigger on multi-touch', () => {
    element.dispatchEvent(createTouchEvent('touchstart', 2));
    vi.advanceTimersByTime(400);

    expect(fixture.componentInstance.onLongPress).not.toHaveBeenCalled();
  });
});
