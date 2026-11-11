import { TestBed } from '@angular/core/testing';

import { DEFAULT_TOAST_CONFIG } from '../toast.interface';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  function createFixture(overrides: Partial<ToastComponent> = {}) {
    const fixture = TestBed.createComponent(ToastComponent);
    const comp = fixture.componentInstance;
    comp.toastId = 1;
    comp.type = 'info';
    comp.message = 'Test message';
    comp.title = 'Test title';
    comp.config = { ...DEFAULT_TOAST_CONFIG };
    comp.enableHtml = false;
    Object.assign(comp, overrides);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(createFixture().componentInstance).toBeTruthy();
  });

  it('sets animationState to "active" on init', () => {
    const { componentInstance: comp } = createFixture({
      config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
    });

    expect(comp.animationState()).toBe('active');
  });

  it('initialises progress at 100', () => {
    const { componentInstance: comp } = createFixture({
      config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
    });

    expect(comp.progress()).toBe(100);
  });

  it('does not start a timer when disableTimeOut is true', async () => {
    const { componentInstance: comp } = createFixture({
      config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
    });

    vi.advanceTimersByTime(99_999);
    expect(comp.animationState()).toBe('active');
  });

  it('sets state to "removed" and emits after timeOut elapses', () => {
    const { componentInstance: comp } = createFixture();
    const spy = vi.spyOn(comp.removed, 'emit');

    vi.advanceTimersByTime(DEFAULT_TOAST_CONFIG.timeOut + 300);
    expect(comp.animationState()).toBe('removed');
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('close() stops event propagation and triggers removal', () => {
    const { componentInstance: comp } = createFixture({
      config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
    });

    const event = { stopPropagation: vi.fn() } as unknown as Event;
    comp.close(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(comp.animationState()).toBe('removed');
  });

  it('onTap() removes the toast when tapToDismiss is true', () => {
    const { componentInstance: comp } = createFixture({
      config: {
        ...DEFAULT_TOAST_CONFIG,
        tapToDismiss: true,
        disableTimeOut: true
      }
    });

    comp.onTap();
    expect(comp.animationState()).toBe('removed');
  });

  it('onTap() does nothing when tapToDismiss is false', () => {
    const { componentInstance: comp } = createFixture({
      config: {
        ...DEFAULT_TOAST_CONFIG,
        tapToDismiss: false,
        disableTimeOut: true
      }
    });

    comp.onTap();
    expect(comp.animationState()).toBe('active');
  });

  it('onEnter() pauses the auto-dismiss timer', async () => {
    const { componentInstance: comp } = createFixture({
      config: { ...DEFAULT_TOAST_CONFIG }
    });
    const spy = vi.spyOn(comp.removed, 'emit');
    // Pause before any timer fires.
    comp.onEnter();
    // Advance well past the original timeout — timer was cleared, so nothing fires.
    vi.advanceTimersByTime(DEFAULT_TOAST_CONFIG.timeOut + 300);
    expect(spy).not.toHaveBeenCalled();
  });

  it('onLeave() resumes dismissal using extendedTimeOut', async () => {
    const { componentInstance: comp } = createFixture();
    const spy = vi.spyOn(comp.removed, 'emit');
    comp.onEnter();
    comp.onLeave();
    vi.advanceTimersByTime(DEFAULT_TOAST_CONFIG.extendedTimeOut + 300);
    expect(spy).toHaveBeenCalledWith(1);
  });

  describe('template rendering', () => {
    it('renders the title', () => {
      const fixture = createFixture({
        config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
      });
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.toast-title')?.textContent?.trim()).toBe(
        'Test title'
      );
    });

    it('renders a plain-text message when enableHtml is false', () => {
      const fixture = createFixture({
        enableHtml: false,
        config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
      });
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.toast-message')?.textContent?.trim()).toBe(
        'Test message'
      );
    });

    it('renders HTML message when enableHtml is true', () => {
      const fixture = createFixture({
        enableHtml: true,
        message: '<strong>bold</strong>',
        config: { ...DEFAULT_TOAST_CONFIG, disableTimeOut: true }
      });
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.toast-message strong')).not.toBeNull();
    });

    it('shows the close button when config.closeButton is true', () => {
      const fixture = createFixture({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          closeButton: true,
          disableTimeOut: true
        }
      });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.toast-close-button')
      ).not.toBeNull();
    });

    it('hides the close button when config.closeButton is false', () => {
      const fixture = createFixture({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          closeButton: false,
          disableTimeOut: true
        }
      });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.toast-close-button')
      ).toBeNull();
    });

    it('shows the progress bar when progressBar is true and disableTimeOut is false', () => {
      const fixture = createFixture({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          progressBar: true,
          disableTimeOut: false
        }
      });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('mat-progress-bar')
      ).not.toBeNull();
    });

    it('hides the progress bar when progressBar is false', () => {
      const fixture = createFixture({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          progressBar: false,
          disableTimeOut: true
        }
      });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('mat-progress-bar')
      ).toBeNull();
    });

    it('hides the progress bar when disableTimeOut is true', () => {
      const fixture = createFixture({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          progressBar: true,
          disableTimeOut: true
        }
      });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('mat-progress-bar')
      ).toBeNull();
    });
  });
});
