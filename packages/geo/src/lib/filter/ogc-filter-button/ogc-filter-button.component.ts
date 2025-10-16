import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import { Layer } from '../../layer';
import { MapBase } from '../../map';
import { OgcFilterableItemComponent } from '../ogc-filterable-item';
import {
  IgoOgcSelector,
  OgcFilterableDataSourceOptions
} from '../shared/ogc-filter.interface';

@Component({
  selector: 'igo-ogc-filter-button',
  templateUrl: './ogc-filter-button.component.html',
  styleUrls: ['./ogc-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    OgcFilterableItemComponent,
    ListItemDirective,
    IgoLanguageModule
  ]
})
export class OgcFilterButtonComponent {
  readonly layer = input<Layer>(undefined);

  readonly options = computed<OgcFilterableDataSourceOptions>(
    () => this.layer()?.dataSource.options
  );

  readonly map = input<MapBase>(undefined);

  readonly color = input('primary');

  readonly header = input<boolean>(undefined);

  public ogcFilterCollapse = false;

  readonly badge = computed(() => this.getBadge());

  getBadge(): string | number {
    const options = this.options();
    const filter = options.ogcFilters as any;
    let cnt = 0;
    if (filter && !filter.advancedOgcFilters) {
      if (filter.pushButtons) {
        const pushButtons = filter.pushButtons as IgoOgcSelector;
        const currentPushButtonGroup = pushButtons.groups.find(
          (gr) => gr.enabled
        );
        let cntPushButtons = 0;
        if (currentPushButtonGroup) {
          currentPushButtonGroup.computedSelectors?.map(
            (cb) =>
              (cntPushButtons += (cb.selectors as any)?.filter(
                (button) => button.enabled
              ).length)
          );
        }
        cnt += cntPushButtons;
      }
      if (filter.checkboxes) {
        const checkboxes = filter.checkboxes as IgoOgcSelector;
        const currentCheckboxGroup = checkboxes.groups.find((gr) => gr.enabled);
        let cntCheckboxes = 0;
        if (currentCheckboxGroup) {
          currentCheckboxGroup.computedSelectors?.map(
            (cb) =>
              (cntCheckboxes += (cb.selectors as any)?.filter(
                (checkbox) => checkbox.enabled
              ).length)
          );
        }
        cnt += cntCheckboxes;
      }
      if (filter.radioButtons) {
        const radioButtons = filter.radioButtons as IgoOgcSelector;
        const currentRadioButtonsGroup = radioButtons.groups.find(
          (gr) => gr.enabled
        );
        let cntRadioButtons = 0;
        if (currentRadioButtonsGroup) {
          currentRadioButtonsGroup.computedSelectors?.map(
            (cb) =>
              (cntRadioButtons += (cb.selectors as any)?.filter(
                (radio) => radio.enabled
              ).length)
          );
        }
        cnt += cntRadioButtons;
      }
      if (filter.select) {
        const select = filter.select as IgoOgcSelector;
        const currentSelectGroup = select.groups.find((gr) => gr.enabled);
        let cntSelect = 0;
        if (currentSelectGroup) {
          currentSelectGroup.computedSelectors?.map(
            (cb) =>
              (cntSelect += (cb.selectors as any)?.filter(
                (multi) => multi.enabled
              ).length)
          );
        }
        cnt += cntSelect;
      }
      if (filter.autocomplete) {
        const autocomplete = filter.autocomplete as IgoOgcSelector;
        const currentAutocompleteGroup = autocomplete.groups.find(
          (gr) => gr.enabled
        );
        let cntAutocomplete = 0;
        if (currentAutocompleteGroup) {
          currentAutocompleteGroup.computedSelectors?.map(
            (cb) =>
              (cntAutocomplete += (cb.selectors as any)?.filter(
                (autocomplete) => autocomplete.enabled
              ).length)
          );
        }
        cnt += cntAutocomplete;
      }
    } else if (filter && filter.filters && !filter.filters.filters) {
      return 1;
    } else if (filter && filter.filters && filter.filters.filters) {
      return filter.filters.filters.length;
    }
    if (
      filter.filters &&
      filter.filters.operator === 'During' &&
      filter.filters.active &&
      filter.interfaceOgcFilters &&
      filter.interfaceOgcFilters[0].active
    ) {
      const filterActiveValue = filter.interfaceOgcFilters[0];
      if (filter.filters.calendarModeYear) {
        // year mode check just year
        if (
          filterActiveValue.begin.substring(0, 4) !==
            options.minDate.substring(0, 4) ||
          filterActiveValue.end.substring(0, 4) !==
            options.maxDate.substring(0, 4)
        ) {
          cnt += 1;
        }
      } else if (
        filterActiveValue.begin !== options.minDate ||
        filterActiveValue.end !== options.maxDate
      ) {
        cnt += 1;
      }
    }
    return cnt > 0 ? cnt : undefined;
  }
}
