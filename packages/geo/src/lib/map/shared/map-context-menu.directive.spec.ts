import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ActionStore } from '@igo2/common/action';
import { SubjectStatus } from '@igo2/utils';

import OlObservable from 'ol/Observable';

import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { LayerController } from '../../layer';
import { IgoMap } from '../../map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { OverlayService } from '../../overlay/shared/overlay.service';
import {
  MapContextMenuAction,
  MapContextMenuDirective
} from './map-context-menu.directive';
import { MapPressDirective } from './press.directive';

function createMapMock(): IgoMap {
  const ol = new OlObservable() as any;
  ol.getInteractions = () => ({ getArray: () => [] });
  ol.addInteraction = vi.fn();
  ol.removeInteraction = vi.fn();
  const viewport = document.createElement('div');
  ol.getViewport = () => viewport;
  // Echo the client position as the map coordinate
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
    // Same code as the output projection so `transform` is identity
    projection: 'EPSG:4326',
    projectionCode: 'EPSG:4326',
    layerController: { all: [] } as unknown as LayerController
  } as unknown as IgoMap;
}

@Component({
  template: `
    <igo-map-browser
      [map]="map"
      [igoMapContextMenu]="menuSource"
      (menuCoordinate)="onCoordinate($event)"
    ></igo-map-browser>
  `,
  imports: [MapBrowserComponent, MapContextMenuDirective]
})
class HostComponent {
  readonly map = createMapMock() as any;
  readonly actionHandler = vi.fn();
  menuSource: MapContextMenuAction[] | ActionStore = [
    { id: 'test-action', title: 'Test', handler: this.actionHandler }
  ];
  onCoordinate = vi.fn();
}

@Component({
  template: `
    <igo-map-browser
      [map]="map"
      igoMapPress
      [igoMapContextMenu]="actions"
    ></igo-map-browser>
  `,
  imports: [MapBrowserComponent, MapPressDirective, MapContextMenuDirective]
})
class ComboHostComponent {
  readonly map = createMapMock() as any;
  readonly actions: MapContextMenuAction[] = [
    { id: 'combo', title: 'Combo', handler: vi.fn() }
  ];
}

describe('MapContextMenuDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, ComboHostComponent],
      providers: [{ provide: OverlayService, useValue: { create: vi.fn() } }]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    element = fixture.debugElement.query(
      By.directive(MapContextMenuDirective)
    ).nativeElement;
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('should emit the menu coordinate on right click', () => {
    // Integer values: MouseEvent client coordinates are WebIDL longs
    element.dispatchEvent(
      new MouseEvent('contextmenu', {
        clientX: -71,
        clientY: 46,
        cancelable: true
      })
    );

    expect(
      fixture.componentInstance.onCoordinate
    ).toHaveBeenCalledExactlyOnceWith([-71, 46]);
  });

  it('should open the default actionbar menu built from the actions', () => {
    element.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: -71, clientY: 46 })
    );

    expect(
      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('igo-actionbar')
    ).toBeTruthy();
  });

  it('should call the action handler with the menu coordinate', async () => {
    element.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: -71, clientY: 46 })
    );
    // The store view updates after an internal debounceTime(5)
    await new Promise((resolve) => setTimeout(resolve, 10));
    fixture.detectChanges();
    const actionItem = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector('igo-actionbar mat-list-item') as HTMLElement;
    actionItem.click();

    expect(
      fixture.componentInstance.actionHandler
    ).toHaveBeenCalledExactlyOnceWith([-71, 46]);
  });

  it('should rebuild the default menu when the actions input changes', async () => {
    const newHandler = vi.fn();
    fixture.componentInstance.menuSource = [
      { id: 'new-action', title: 'New', handler: newHandler }
    ];
    fixture.detectChanges();

    element.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: -71, clientY: 46 })
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    fixture.detectChanges();
    const actionItem = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector('igo-actionbar mat-list-item') as HTMLElement;
    actionItem.click();

    expect(newHandler).toHaveBeenCalledExactlyOnceWith([-71, 46]);
    expect(fixture.componentInstance.actionHandler).not.toHaveBeenCalled();
  });

  it('should pass the action args to the handler after the coordinate', async () => {
    const handler = vi.fn();
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.menuSource = [
      { id: 'with-args', title: 'With args', handler, args: ['zoom', 12] }
    ];
    fixture.detectChanges();
    element = fixture.debugElement.query(
      By.directive(MapContextMenuDirective)
    ).nativeElement;

    element.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: -71, clientY: 46 })
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    fixture.detectChanges();
    const actionItem = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector('igo-actionbar mat-list-item') as HTMLElement;
    actionItem.click();

    expect(handler).toHaveBeenCalledExactlyOnceWith([-71, 46], 'zoom', 12);
  });

  it('should accept an ActionStore managed by the consumer', () => {
    // Recreate the component with an ActionStore before first render
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.menuSource = new ActionStore([]);
    fixture.detectChanges();
    element = fixture.debugElement.query(
      By.directive(MapContextMenuDirective)
    ).nativeElement;

    element.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: -71, clientY: 46 })
    );

    expect(
      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('igo-actionbar')
    ).toBeTruthy();
  });

  it('should emit the menu coordinate on touch long press', () => {
    vi.useFakeTimers();
    // Float32-exact values: Touch coordinates are stored as float32
    const touch = new Touch({
      identifier: 1,
      target: element,
      clientX: -71.5,
      clientY: 46.5,
      pageX: -71.5,
      pageY: 46.5
    });

    element.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: [touch],
        changedTouches: [touch]
      })
    );
    vi.advanceTimersByTime(400);

    expect(
      fixture.componentInstance.onCoordinate
    ).toHaveBeenCalledExactlyOnceWith([-71.5, 46.5]);
  });

  it('should coexist with igoMapPress on the same element (no NG0309)', () => {
    vi.useFakeTimers();
    const comboFixture = TestBed.createComponent(ComboHostComponent);

    expect(() => comboFixture.detectChanges()).not.toThrow();

    // The single long press instance (hosted by igoContextMenu) opens
    // the menu and feeds igoMapPress's longpress trigger
    const comboDebugElement = comboFixture.debugElement.query(
      By.directive(MapContextMenuDirective)
    );
    const host: HTMLElement = comboDebugElement.nativeElement;
    const mapPress = comboDebugElement.injector.get(MapPressDirective);
    const emitted = vi.fn();
    mapPress.mapPress.subscribe(emitted);
    const touch = new Touch({
      identifier: 1,
      target: host,
      clientX: -71.5,
      clientY: 46.5,
      pageX: -71.5,
      pageY: 46.5
    });
    host.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: [touch],
        changedTouches: [touch]
      })
    );
    vi.advanceTimersByTime(400);

    expect(
      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('igo-actionbar')
    ).toBeTruthy();
    expect(emitted).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ trigger: 'longpress' })
    );
  });
});
