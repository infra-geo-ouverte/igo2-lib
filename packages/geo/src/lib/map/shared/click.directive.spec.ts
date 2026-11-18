import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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
import { MapClickDirective } from './click.directive';
import { MAP_CLICK_MESSAGE_TYPE } from './click.interface';

function createMapMock(): IgoMap {
  const ol = new OlObservable() as any;
  ol.getInteractions = () => ({ getArray: () => [] });
  ol.addInteraction = vi.fn();
  ol.removeInteraction = vi.fn();

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
    igoMapClick
    [withClickOverlay]="withClickOverlay"
    [parentMessageOrigin]="parentMessageOrigin"
  ></igo-map-browser>`,
  imports: [MapBrowserComponent, MapClickDirective]
})
class HostComponent {
  readonly map = createMapMock() as any;
  withClickOverlay = true;
  parentMessageOrigin = '*';
}

describe('MapClickDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let overlayMock: Overlay;
  let overlayService: { create: ReturnType<typeof vi.fn> };

  const getDirective = (): MapClickDirective =>
    fixture.debugElement
      .query(By.directive(MapClickDirective))
      .injector.get(MapClickDirective);

  const dispatchSingleClick = (coordinate: [number, number]) => {
    fixture.componentInstance.map.ol.dispatchEvent({
      type: 'singleclick',
      coordinate
    });
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

  it('should create the overlay on init by default', () => {
    fixture.detectChanges();

    expect(overlayService.create).toHaveBeenCalledWith(
      fixture.componentInstance.map
    );
    expect(getDirective().overlay).toBe(overlayMock);
  });

  it('should not create the overlay when withClickOverlay is false', () => {
    fixture.componentInstance.withClickOverlay = false;
    fixture.detectChanges();

    expect(overlayService.create).not.toHaveBeenCalled();
    expect(getDirective().overlay).toBeUndefined();
  });

  it('should emit mapClick with rounded coordinates on singleclick', () => {
    fixture.detectChanges();
    const emitted = vi.fn();
    getDirective().mapClick.subscribe(emitted);

    dispatchSingleClick([-71.123456789, 46.987654321]);

    expect(emitted).toHaveBeenCalledExactlyOnceWith({
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

  it('should still emit mapClick without an overlay', () => {
    fixture.componentInstance.withClickOverlay = false;
    fixture.detectChanges();
    const emitted = vi.fn();
    getDirective().mapClick.subscribe(emitted);

    dispatchSingleClick([-71.2, 46.8]);

    expect(emitted).toHaveBeenCalledOnce();
    expect(overlayMock.addFeature).not.toHaveBeenCalled();
  });

  it('should stop listening and remove the overlay layer on destroy', () => {
    fixture.detectChanges();
    const emitted = vi.fn();
    getDirective().mapClick.subscribe(emitted);
    const map = fixture.componentInstance.map;

    fixture.destroy();
    dispatchSingleClick([-71.2, 46.8]);

    expect(emitted).not.toHaveBeenCalled();
    expect(map.layerController.remove).toHaveBeenCalledExactlyOnceWith(
      overlayMock.layer
    );
  });

  describe('parent frame messaging', () => {
    // `self` and `parent` are [Replaceable] own properties of `window`:
    // assignment shadows them, so keep the originals to restore them
    const mutableWindow = window as unknown as Record<
      'self' | 'parent',
      unknown
    >;
    const originalSelf = window.self;
    const originalParent = window.parent;

    afterEach(() => {
      mutableWindow.self = originalSelf;
      mutableWindow.parent = originalParent;
    });

    const fakeIframeContext = () => {
      const postMessage = vi.fn();
      mutableWindow.self = {};
      mutableWindow.parent = { postMessage };
      return postMessage;
    };

    it('should post the click to the parent frame when embedded', () => {
      fixture.detectChanges();
      const postMessage = fakeIframeContext();

      dispatchSingleClick([-71.2, 46.8]);

      expect(postMessage).toHaveBeenCalledExactlyOnceWith(
        {
          type: MAP_CLICK_MESSAGE_TYPE,
          data: {
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
        expect.objectContaining({ type: MAP_CLICK_MESSAGE_TYPE }),
        'https://parent.example'
      );
    });

    it('should not post any message when not embedded', () => {
      fixture.detectChanges();
      const postMessage = vi.fn();
      // The vitest browser runner itself runs in an iframe, so simulate
      // a top-level window by making `self === top`
      mutableWindow.self = window.top;
      mutableWindow.parent = { postMessage };

      dispatchSingleClick([-71.2, 46.8]);

      expect(postMessage).not.toHaveBeenCalled();
    });
  });
});
