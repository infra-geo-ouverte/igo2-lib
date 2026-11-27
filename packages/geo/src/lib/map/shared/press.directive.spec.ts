import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LongPressDirective } from '@igo2/common/context-menu';
import { SubjectStatus } from '@igo2/utils';

import OlObservable from 'ol/Observable';

import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { FeatureMotion } from '../../feature/shared/feature.enums';
import { LayerController } from '../../layer';
import { IgoMap } from '../../map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Overlay } from '../../overlay/shared/overlay';
import { OverlayService } from '../../overlay/shared/overlay.service';
import { MapPressDirective } from './press.directive';
import { MAP_PRESS_MESSAGE_TYPE } from './press.interface';

function createMapMock(): IgoMap {
  const ol = new OlObservable() as any;
  ol.getInteractions = () => ({ getArray: () => [] });
  ol.addInteraction = vi.fn();
  ol.removeInteraction = vi.fn();
  const viewport = document.createElement('div');
  ol.getViewport = () => viewport;
  // Echo the client position as the map coordinate
  ol.getEventCoordinate = (event: MouseEvent) => [event.clientX, event.clientY];
  ol.getEventPixel = (event: MouseEvent | TouchEvent) => {
    const position =
      'changedTouches' in event ? event.changedTouches[0] : event;
    return [position.clientX, position.clientY];
  };
  ol.getCoordinateFromPixel = (pixel: [number, number]) => pixel;

  return {
    ol,
    status$: new BehaviorSubject(SubjectStatus.Done),
    setTarget: vi.fn(),
    updateView: vi.fn(),
    updateControls: vi.fn(),
    // Same code as the click output projection so `transform` is identity
    projection: 'EPSG:4326',
    projectionCode: 'EPSG:4326',
    layerController: {
      all: [],
      remove: vi.fn()
    } as unknown as LayerController
  } as unknown as IgoMap;
}

function createOverlayMock(): Overlay {
  return {
    layer: { id: 'overlay-layer' },
    clear: vi.fn(),
    addFeature: vi.fn()
  } as unknown as Overlay;
}

@Component({
  template: `<igo-map-browser
    [map]="map"
    igoMapPress
    igoLongPress
    [withPressOverlay]="withPressOverlay"
    [parentMessageOrigin]="parentMessageOrigin"
  ></igo-map-browser>`,
  imports: [MapBrowserComponent, MapPressDirective, LongPressDirective]
})
class HostComponent {
  readonly map = createMapMock() as any;
  withPressOverlay = true;
  parentMessageOrigin = '*';
}

describe('MapPressDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let overlayMock: Overlay;
  let overlayService: { create: ReturnType<typeof vi.fn> };

  const getDirective = (): MapPressDirective =>
    fixture.debugElement
      .query(By.directive(MapPressDirective))
      .injector.get(MapPressDirective);

  const dispatchSingleClick = (coordinate: [number, number]) => {
    fixture.componentInstance.map.ol.dispatchEvent({
      type: 'singleclick',
      coordinate
    });
  };

  const getViewport = (): HTMLElement =>
    fixture.componentInstance.map.ol.getViewport();

  const dispatchContextMenu = (coordinate: [number, number]): MouseEvent => {
    const domEvent = new MouseEvent('contextmenu', {
      clientX: coordinate[0],
      clientY: coordinate[1],
      cancelable: true
    });
    getViewport().dispatchEvent(domEvent);
    return domEvent;
  };

  const dispatchTouch = (
    type: 'touchstart' | 'touchmove' | 'touchend',
    coordinate: [number, number]
  ) => {
    // igoLongPress listens on the host element, not the viewport
    const host: HTMLElement = fixture.debugElement.query(
      By.directive(MapPressDirective)
    ).nativeElement;
    const touch = new Touch({
      identifier: 1,
      target: host,
      clientX: coordinate[0],
      clientY: coordinate[1]
    });
    host.dispatchEvent(
      new TouchEvent(type, {
        touches: type === 'touchend' ? [] : [touch],
        changedTouches: [touch]
      })
    );
  };

  beforeEach(async () => {
    overlayMock = createOverlayMock();
    overlayService = { create: vi.fn(() => overlayMock) };

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: OverlayService, useValue: overlayService }]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should create the directive when used as template attribute', () => {
    fixture.detectChanges();

    expect(getDirective()).toBeTruthy();
  });

  it('should create the overlay when withPressOverlay is true', () => {
    fixture.detectChanges();

    expect(overlayService.create).toHaveBeenCalledWith(
      fixture.componentInstance.map
    );
    expect(getDirective().overlay).toBe(overlayMock);
  });

  it('should not create the overlay when withPressOverlay is false', () => {
    fixture.componentInstance.withPressOverlay = false;
    fixture.detectChanges();

    expect(overlayService.create).not.toHaveBeenCalled();
    expect(getDirective().overlay).toBeUndefined();
  });

  it('should emit mapPress with rounded coordinates on singleclick', () => {
    fixture.detectChanges();
    const emitted = vi.fn();
    getDirective().mapPress.subscribe(emitted);

    dispatchSingleClick([-71.123456789, 46.987654321]);

    expect(emitted).toHaveBeenCalledExactlyOnceWith({
      trigger: 'click',
      longitude: -71.123457,
      latitude: 46.987654,
      timestamp: expect.any(Number)
    });
  });

  it('should add the clicked point to the overlay', () => {
    fixture.detectChanges();

    dispatchSingleClick([-71.2, 46.8]);

    expect(overlayMock.clear).toHaveBeenCalledOnce();
    expect(overlayMock.addFeature).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        projection: 'EPSG:4326',
        geometry: expect.objectContaining({ type: 'Point' })
      }),
      FeatureMotion.None
    );
  });

  it('should still emit mapPress without an overlay', () => {
    fixture.componentInstance.withPressOverlay = false;
    fixture.detectChanges();
    const emitted = vi.fn();
    getDirective().mapPress.subscribe(emitted);

    dispatchSingleClick([-71.2, 46.8]);

    expect(emitted).toHaveBeenCalledOnce();
    expect(overlayMock.addFeature).not.toHaveBeenCalled();
  });

  it('should stop listening and remove the overlay layer on destroy', () => {
    fixture.detectChanges();
    const emitted = vi.fn();
    getDirective().mapPress.subscribe(emitted);
    const map = fixture.componentInstance.map;

    fixture.destroy();
    dispatchSingleClick([-71.2, 46.8]);

    expect(emitted).not.toHaveBeenCalled();
    expect(map.layerController.remove).toHaveBeenCalledExactlyOnceWith(
      overlayMock.layer
    );
  });

  describe('secondary click (right click / long press)', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should emit mapPress and prevent the native menu on contextmenu', () => {
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      // Integer values: MouseEvent client coordinates are WebIDL longs
      const domEvent = dispatchContextMenu([-71, 46]);

      expect(domEvent.defaultPrevented).toBe(true);
      expect(emitted).toHaveBeenCalledExactlyOnceWith({
        trigger: 'contextmenu',
        longitude: -71,
        latitude: 46,
        timestamp: expect.any(Number)
      });
    });

    it('should not touch the overlay on a secondary click', () => {
      fixture.detectChanges();

      dispatchContextMenu([-71, 46]);

      expect(overlayMock.clear).not.toHaveBeenCalled();
      expect(overlayMock.addFeature).not.toHaveBeenCalled();
    });

    it('should emit mapPress on touch long press (igoLongPress)', () => {
      vi.useFakeTimers();
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      // Float32-exact values: Touch coordinates are stored as float32
      dispatchTouch('touchstart', [-71.5, 46.5]);
      vi.advanceTimersByTime(400);

      expect(emitted).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ trigger: 'longpress', longitude: -71.5 })
      );
    });

    it('should not emit twice when contextmenu follows the long press', () => {
      vi.useFakeTimers();
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      dispatchTouch('touchstart', [-71.5, 46.5]);
      vi.advanceTimersByTime(400);
      dispatchContextMenu([-71.5, 46.5]);

      expect(emitted).toHaveBeenCalledOnce();
    });

    it('should cancel the long press when the touch moves', () => {
      vi.useFakeTimers();
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      dispatchTouch('touchstart', [-71.5, 46.5]);
      dispatchTouch('touchmove', [-71.5 + 20, 46.5]);
      vi.advanceTimersByTime(400);

      expect(emitted).not.toHaveBeenCalled();
    });

    it('should cancel the long press on touchend', () => {
      vi.useFakeTimers();
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      dispatchTouch('touchstart', [-71.5, 46.5]);
      dispatchTouch('touchend', [-71.5, 46.5]);
      vi.advanceTimersByTime(400);

      expect(emitted).not.toHaveBeenCalled();
    });

    it('should not emit a click when OL fires singleclick after a long press release', () => {
      vi.useFakeTimers();
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      dispatchTouch('touchstart', [-71.5, 46.5]);
      vi.advanceTimersByTime(400);
      // OL fires a singleclick when the finger is released
      dispatchSingleClick([-71.5, 46.5]);

      expect(emitted).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ trigger: 'longpress' })
      );
    });

    it('should emit clicks again on the next gesture after a long press', () => {
      vi.useFakeTimers();
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      dispatchTouch('touchstart', [-71.5, 46.5]);
      vi.advanceTimersByTime(400);
      // New gesture: pointerdown resets the suppression
      getViewport().dispatchEvent(new PointerEvent('pointerdown'));
      dispatchSingleClick([-71.5, 46.5]);

      expect(emitted).toHaveBeenCalledTimes(2);
      expect(emitted).toHaveBeenLastCalledWith(
        expect.objectContaining({ trigger: 'click' })
      );
    });

    it('should stop handling secondary clicks on destroy', () => {
      fixture.detectChanges();
      const emitted = vi.fn();
      getDirective().mapPress.subscribe(emitted);

      fixture.destroy();
      dispatchContextMenu([-71.2, 46.8]);

      expect(emitted).not.toHaveBeenCalled();
    });
  });

  describe('parent frame messaging', () => {
    // `parent` is a [Replaceable] own property of `window`: assignment
    // shadows it, so keep the original to restore it
    const mutableWindow = window as unknown as Record<'parent', unknown>;
    const originalParent = window.parent;

    afterEach(() => {
      mutableWindow.parent = originalParent;
    });

    const fakeIframeContext = () => {
      const postMessage = vi.fn();
      // Embedded: the parent differs from the window itself
      mutableWindow.parent = { postMessage };
      return postMessage;
    };

    it('should post the click to the parent frame when embedded', () => {
      fixture.detectChanges();
      const postMessage = fakeIframeContext();

      dispatchSingleClick([-71.2, 46.8]);

      expect(postMessage).toHaveBeenCalledExactlyOnceWith(
        {
          type: MAP_PRESS_MESSAGE_TYPE,
          data: {
            trigger: 'click',
            longitude: -71.2,
            latitude: 46.8,
            timestamp: expect.any(Number)
          }
        },
        '*'
      );
    });

    it('should use the configured parentMessageOrigin', () => {
      fixture.componentInstance.parentMessageOrigin = 'https://parent.example';
      fixture.detectChanges();
      const postMessage = fakeIframeContext();

      dispatchSingleClick([-71.2, 46.8]);

      expect(postMessage).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ type: MAP_PRESS_MESSAGE_TYPE }),
        'https://parent.example'
      );
    });

    it('should not post any message when not embedded', () => {
      fixture.detectChanges();
      // Top-level window: it is its own parent
      mutableWindow.parent = window;
      const postMessage = vi.spyOn(window, 'postMessage');

      dispatchSingleClick([-71.2, 46.8]);

      expect(postMessage).not.toHaveBeenCalled();
    });
  });
});
