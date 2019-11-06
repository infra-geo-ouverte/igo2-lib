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

  public tooltip: string;

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
    this.tooltip = this.computeTooltip(this.isInResolutionsRange());
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick() {
    this.added ? this.remove() : this.add();
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
    const inRange = this.resolution >= minResolution && this.resolution <= maxResolution;
    this.tooltip = this.computeTooltip(inRange);
    return inRange;
  }

  computeTooltip(inRange): string {
      return this.added ? 'igo.geo.catalog.layer.removeFromMap' :
      inRange ? 'igo.geo.catalog.layer.addToMap' : 'igo.geo.catalog.layer.addToMapOutRange';
  }

}
