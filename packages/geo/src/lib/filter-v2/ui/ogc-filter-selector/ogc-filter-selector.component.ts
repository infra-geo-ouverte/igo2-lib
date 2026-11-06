import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  OgcFilterSelectorState,
  OgcFilterStore
} from '../../state/ogc-filter.store';

/**
 * Renders the predefined filter selectors of a store. One component covers
 * the five legacy presentations (pushButton, checkbox, radioButton, select,
 * autocomplete) that previously required five duplicated configuration
 * blocks and templates.
 */
@Component({
  selector: 'igo-ogc-filter-selector',
  templateUrl: './ogc-filter-selector.component.html',
  styleUrls: ['./ogc-filter-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatOptionModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule
  ]
})
export class OgcFilterSelectorComponent {
  readonly store = input.required<OgcFilterStore>();

  enabledTitles(selector: OgcFilterSelectorState): string[] | string {
    const titles = selector.items
      .filter((item) => item.enabled)
      .map((item) => item.title);
    return selector.multiple ? titles : (titles[0] ?? '');
  }

  onSelectionChange(
    selector: OgcFilterSelectorState,
    value: string | string[]
  ): void {
    const values = Array.isArray(value) ? value : [value];
    for (const item of selector.items) {
      this.store().toggleSelectorItem(
        selector.id,
        item.title,
        values.includes(item.title)
      );
    }
  }
}
