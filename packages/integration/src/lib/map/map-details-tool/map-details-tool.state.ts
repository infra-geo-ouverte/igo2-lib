import { Injectable, EventEmitter, Output } from '@angular/core';

/**
 * Service that holds the state of the map module
 */
@Injectable({
  providedIn: 'root'
})
export class MapDetailsState {

  @Output() searchToolActivate = new EventEmitter();
  @Output() catalogToolActivate = new EventEmitter();
  @Output() contextToolActivate = new EventEmitter();

  constructor() {}

  activateSearchTool() {
    this.searchToolActivate.emit();
  }

  activateCatalogTool() {
    this.catalogToolActivate.emit();
  }

  activateContextTool() {
    this.contextToolActivate.emit();
  }
}
