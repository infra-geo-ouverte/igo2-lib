import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'igo-ogc-filter-chips',
  templateUrl: './ogc-filter-chips.component.html',
  styleUrls: ['./ogc-filter-chips.component.scss']
})
export class OgcFilterChipsComponent {

  @Input() activeFilters: string[];
  @Input() size: number;
  @Input() thresholdSize: number; // number of options at which the chips won't appear
  @Output() autocompleteOptionClick: EventEmitter<string> = new EventEmitter<string>();

  onAutocompleteOptionClick(filter: string) {
    this.autocompleteOptionClick.emit(filter);
  }

  constructor() { }

}
