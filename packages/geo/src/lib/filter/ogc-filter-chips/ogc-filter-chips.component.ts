import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'igo-ogc-filter-chips',
  templateUrl: './ogc-filter-chips.component.html',
  standalone: true,
  imports: [NgIf, NgFor, MatTooltipModule, MatIconModule, TranslateModule],
  styleUrls: ['./ogc-filter-chips.component.scss']
})
export class OgcFilterChipsComponent {
  @Input() activeFilters: string[];
  @Input() size: number;
  @Input() thresholdSize: number; // number of options at which the chips won't appear
  @Output() autocompleteOptionClick: EventEmitter<string> =
    new EventEmitter<string>();

  onAutocompleteOptionClick(filter: string) {
    this.autocompleteOptionClick.emit(filter);
  }

  constructor() {}
}
