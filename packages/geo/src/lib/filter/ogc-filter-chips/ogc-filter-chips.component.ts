import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'igo-ogc-filter-chips',
  templateUrl: './ogc-filter-chips.component.html',
  styleUrls: ['./ogc-filter-chips.component.scss']
})
export class OgcFilterChipsComponent {

  @Input() activeFilters: string[];
  @Input() size: number;
  @Output() autocompleteOptionClick: EventEmitter<string> = new EventEmitter<string>();

  public thresholdSize: number = 5; // maximum filter options where the chip list will be represented (prevent clutter)

  onAutocompleteOptionClick(filter: string) {
    this.autocompleteOptionClick.emit(filter);
  }

  constructor() { }

}
