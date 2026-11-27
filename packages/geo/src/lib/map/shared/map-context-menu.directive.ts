import {
  ComponentRef,
  Directive,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
  inject,
  input,
  output
} from '@angular/core';

import { Action, ActionStore } from '@igo2/common/action';
import { ContextMenuDirective } from '@igo2/common/context-menu';

import { transform } from 'ol/proj';

import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { MapContextMenuContentComponent } from './map-context-menu-content.component';
import { roundCoordTo } from './map.utils';

/**
 * Context menu action whose handler receives the coordinate of the
 * menu opening point (EPSG:4326 [longitude, latitude]), followed by
 * the action's `args`, if any
 */
export interface MapContextMenuAction extends Omit<Action, 'handler'> {
  handler: (coordinate: [number, number], ...args: unknown[]) => void;
}

/**
 * Map context menu: brings igoContextMenu along (host directive) and
 * converts the screen position of the menu opening (right click or
 * long press) into a map coordinate.
 *
 * Bind `MapContextMenuAction[]` to get a default actionbar menu whose
 * handlers receive the clicked coordinate, or an `ActionStore` to
 * manage the actions yourself. A custom template bound with
 * `[igoContextMenu]` takes precedence over the default menu.
 */
@Directive({
  selector: '[igoMapContextMenu]',
  hostDirectives: [
    {
      directive: ContextMenuDirective,
      inputs: ['igoContextMenu'],
      outputs: ['menuPosition']
    }
  ]
})
export class MapContextMenuDirective implements OnChanges {
  /**
   * Actions of the default actionbar menu, or an ActionStore to
   * manage them manually
   */
  readonly actions = input<
    MapContextMenuAction[] | ActionStore | string | undefined
  >(undefined, { alias: 'igoMapContextMenu' });

  /**
   * Coordinate of the menu opening point, in EPSG:4326
   * [longitude, latitude], rounded to 6 decimals
   */
  menuCoordinate = output<[number, number]>();

  private component = inject(MapBrowserComponent, { self: true });
  private contextMenu = inject(ContextMenuDirective, { self: true });
  private viewContainerRef = inject(ViewContainerRef);

  /**
   * Coordinate of the last menu opening, provided to the action
   * handlers at trigger time
   */
  private lastCoordinate: [number, number] | undefined;

  /**
   * Store backing the default menu when actions are provided as
   * an array; reloaded on every input change
   */
  private internalStore: ActionStore | undefined;

  /**
   * Dynamically created default menu content
   */
  private content: ComponentRef<MapContextMenuContentComponent> | undefined;

  constructor() {
    this.contextMenu.menuPosition.subscribe(({ event }) => {
      const map = this.component.map();
      // getEventPixel handles both mouse and touch events
      const pixel = map.ol.getEventPixel(event);
      const coordinate = map.ol.getCoordinateFromPixel(pixel);
      const lonLat = transform(coordinate, map.projectionCode, 'EPSG:4326');
      this.lastCoordinate = roundCoordTo(lonLat, 6) as [number, number];
      this.menuCoordinate.emit(this.lastCoordinate);
    });
  }

  /**
   * (Re)build the default actionbar menu whenever the actions input
   * changes (a bare `igoMapContextMenu` attribute yields an empty string)
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['actions']) {
      this.applyActions();
    }
  }

  private applyActions() {
    const store = this.resolveStore(this.actions());
    if (!store) {
      return;
    }
    if (!this.content) {
      this.content = this.viewContainerRef.createComponent(
        MapContextMenuContentComponent
      );
    }
    this.content.setInput('store', store);
    this.content.changeDetectorRef.detectChanges();
    this.contextMenu.setMenuContext(this.content.instance.template());
  }

  private resolveStore(
    actions: MapContextMenuAction[] | ActionStore | string | undefined
  ): ActionStore | undefined {
    if (actions instanceof ActionStore) {
      return actions;
    }
    if (!Array.isArray(actions)) {
      return undefined;
    }
    this.internalStore ??= new ActionStore([]);
    this.internalStore.load(
      actions.map((action) => ({
        ...action,
        // Provide the coordinate of the menu opening to the handler,
        // followed by the action's own args
        handler: () => {
          if (this.lastCoordinate) {
            action.handler(this.lastCoordinate, ...(action.args ?? []));
          }
        }
      }))
    );
    return this.internalStore;
  }
}
