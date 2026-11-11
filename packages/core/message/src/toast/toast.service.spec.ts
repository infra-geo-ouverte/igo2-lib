import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body
      .querySelectorAll('igo-toast-container')
      .forEach((el) => el.remove());
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('success / error / info / warning', () => {
    it('success() returns an ActiveToast with a positive id', () => {
      expect(service.success('msg', 'title').toastId).toBeGreaterThan(0);
    });

    it('error() returns an ActiveToast with a positive id', () => {
      expect(service.error('msg', 'title').toastId).toBeGreaterThan(0);
    });

    it('info() returns an ActiveToast with a positive id', () => {
      expect(service.info('msg', 'title').toastId).toBeGreaterThan(0);
    });

    it('warning() returns an ActiveToast with a positive id', () => {
      expect(service.warning('msg', 'title').toastId).toBeGreaterThan(0);
    });

    it('assigns incrementing ids to successive toasts', () => {
      service.configure({ preventDuplicates: false });
      const a = service.info('a', 'A');
      const b = service.info('b', 'B');
      expect(b.toastId).toBe(a.toastId + 1);
    });
  });

  describe('configure()', () => {
    it('overrides default config values for subsequent toasts', () => {
      service.configure({ timeOut: 5000 });
      service.info('msg', 'title');
      const [toast] = service.getActiveToasts();
      expect(toast.config.timeOut).toBe(5000);
    });
  });

  describe('getActiveToasts()', () => {
    it('returns an empty array initially', () => {
      expect(service.getActiveToasts()).toEqual([]);
    });

    it('includes toast data after show', () => {
      service.configure({ preventDuplicates: false });
      service.info('Hello', 'Title');
      const [toast] = service.getActiveToasts();
      expect(toast.message).toBe('Hello');
      expect(toast.title).toBe('Title');
      expect(toast.type).toBe('info');
    });
  });

  describe('preventDuplicates', () => {
    it('returns the same toastId for identical message + title', () => {
      service.configure({ preventDuplicates: true });
      const first = service.info('same', 'same');
      const second = service.info('same', 'same');
      expect(second.toastId).toBe(first.toastId);
    });

    it('creates a new toast when content differs', () => {
      service.configure({ preventDuplicates: true });
      const a = service.info('one', 'title');
      const b = service.info('two', 'title');
      expect(b.toastId).not.toBe(a.toastId);
    });
  });

  describe('maxOpened', () => {
    it('removes the oldest toast when the limit is reached', () => {
      service.configure({ maxOpened: 2, preventDuplicates: false });
      const first = service.info('a', 'A');
      service.info('b', 'B');
      service.info('c', 'C');
      // Allow the removal animation (300 ms) to complete.
      vi.advanceTimersByTime(300);
      const ids = service.getActiveToasts().map((t) => t.toastId);
      expect(ids).not.toContain(first.toastId);
      expect(service.getActiveToasts()).toHaveLength(2);
    });
  });

  describe('updateToast()', () => {
    it('updates message and title on the active toast', () => {
      service.configure({ preventDuplicates: false });
      const { toastId } = service.info('original', 'OldTitle');
      service.updateToast(toastId, 'updated', 'NewTitle');
      const ref = service.getActiveToasts().find((t) => t.toastId === toastId)!;
      expect(ref.message).toBe('updated');
      expect(ref.title).toBe('NewTitle');
    });

    it('is a no-op for an unknown toastId', () => {
      expect(() => service.updateToast(9999, 'x', 'y')).not.toThrow();
    });
  });

  describe('removeToast()', () => {
    it('removes the toast from active toasts immediately', () => {
      service.configure({ preventDuplicates: false });
      const { toastId } = service.info('msg', 'title');
      service.removeToast(toastId);
      expect(service.getActiveToasts()).toHaveLength(0);
    });

    it('destroys the container element when the last toast is removed', () => {
      service.configure({ preventDuplicates: false });
      const { toastId } = service.info('msg', 'title');
      service.removeToast(toastId);
      expect(document.querySelector('igo-toast-container')).toBeNull();
    });

    it('is a no-op for an unknown toastId', () => {
      expect(() => service.removeToast(9999)).not.toThrow();
    });
  });

  describe('remove()', () => {
    it('triggers the removal animation and removes the toast after 300 ms', () => {
      service.configure({ preventDuplicates: false, disableTimeOut: true });
      const { toastId } = service.info('msg', 'title');
      service.remove(toastId);
      vi.advanceTimersByTime(300);
      expect(service.getActiveToasts()).toHaveLength(0);
    });

    it('is a no-op for an unknown toastId', () => {
      expect(() => service.remove(9999)).not.toThrow();
    });
  });

  describe('DOM integration', () => {
    it('appends a container element to the body', () => {
      service.info('msg', 'title');
      expect(document.querySelector('igo-toast-container')).not.toBeNull();
    });

    it('applies positionClass to the container host element', () => {
      service.configure({ positionClass: 'toast-top-left' });
      service.info('msg', 'title');
      expect(document.querySelector('.toast-top-left')).not.toBeNull();
    });

    it('reuses a single container for multiple toasts', () => {
      service.configure({ preventDuplicates: false });
      service.info('a', 'A');
      service.info('b', 'B');
      expect(document.querySelectorAll('igo-toast-container')).toHaveLength(1);
    });
  });
});
