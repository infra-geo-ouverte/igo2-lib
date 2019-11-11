import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, OnInit } from '@angular/core';

import { getEntityTitle, getEntityIcon } from '@igo2/common';

import { CatalogItemLayer } from '../shared';
import { BehaviorSubject } from 'rxjs';

/**
 * Catalog browser layer item
 */
@Component({
  selector: 'igo-catalog-browser-layer',
  templateUrl: './catalog-browser-layer.component.html',
  styleUrls: ['./catalog-browser-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogBrowserLayerComponent implements OnInit {

  public inRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public isPreview$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() resolution: number;

  /**
   * Catalog layer
   */
  @Input() layer: CatalogItemLayer;

  /**
   * Whether the layer is already added to the map
   */
  @Input() added = false;

  /**
   * Event emitted when the add/remove button is clicked
   */
  @Output() addedChange = new EventEmitter<{
    added: boolean;
    layer: CatalogItemLayer;
  }>();

  @Output() addedLayerIsPreview = new EventEmitter<boolean>();

  /**
   * @internal
   */
  get title(): string { return getEntityTitle(this.layer); }

  /**
   * @internal
   */
  get icon(): string { return getEntityIcon(this.layer) || 'layers'; }

  constructor() {}

  ngOnInit(): void {
    this.isInResolutionsRange();
    this.isPreview$.subscribe(value =>
      this.addedLayerIsPreview.emit(value)
    );
  }

  /**
   * On mouse event, mouseenter /mouseleave
   * @internal
   */
  onMouseEvent(event) {
    this.onToggleClick(event);
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick(event) {
    switch (event.type) {
        case 'click':
            if (!this.isPreview$.value) {
                this.remove();
            }
            this.isPreview$.next(!this.isPreview$.value);
            break;
        case 'mouseenter':
            if (!this.isPreview$.value && !this.added) {
                this.add();
                this.isPreview$.next(true);
            }
            break;
        case 'mouseleave':
            if (this.isPreview$.value) {
                this.remove();
                this.isPreview$.next(false);
            }
            break;
        default:
            break;
    }
  }

  /**
   * Emit added change event with added = true
   */
  private add() {
    this.added = true;
    this.addedChange.emit({added: true, layer: this.layer});
  }

  /**
   * Emit added change event with added = false
   */
  private remove() {
    this.added = false;
    this.addedChange.emit({added: false, layer: this.layer});
  }

  isInResolutionsRange(): boolean {
    const minResolution = this.layer.options.minResolution;
    const maxResolution = this.layer.options.maxResolution;
    this.inRange$.next(this.resolution >= minResolution && this.resolution <= maxResolution);
    return this.inRange$.value;
  }

  computeTooltip(): string {
    if (this.added) {
      return this.isPreview$.value ? 'igo.geo.catalog.layer.addToMap' :
      this.inRange$.value ? 'igo.geo.catalog.layer.removeFromMap' : 'igo.geo.catalog.layer.removeFromMapOutRange';
    } else {
      return this.inRange$.value ? 'igo.geo.catalog.layer.addToMap' : 'igo.geo.catalog.layer.addToMapOutRange';
    }
  }

}
