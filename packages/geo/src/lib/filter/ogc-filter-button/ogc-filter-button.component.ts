import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ListItemDirective } from '@igo2/common';

import { TranslateModule } from '@ngx-translate/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map/shared/map';
import { OgcFilterableItemComponent } from '../ogc-filterable-item/ogc-filterable-item.component';
import {
  IgoOgcSelector,
  OgcFilterableDataSourceOptions
} from '../shared/ogc-filter.interface';

@Component({
  selector: 'igo-ogc-filter-button',
  templateUrl: './ogc-filter-button.component.html',
  styleUrls: ['./ogc-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    OgcFilterableItemComponent,
    ListItemDirective,
    TranslateModule
  ]
})
export class OgcFilterButtonComponent implements OnInit {
  public options: OgcFilterableDataSourceOptions;

  get badge() {
    const filter = this.options.ogcFilters as any;
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
            this.options.minDate.substring(0, 4) ||
          filterActiveValue.end.substring(0, 4) !==
            this.options.maxDate.substring(0, 4)
        ) {
          cnt += 1;
        }
      } else if (
        filterActiveValue.begin !== this.options.minDate ||
        filterActiveValue.end !== this.options.maxDate
      ) {
        cnt += 1;
      }
    }
    return cnt > 0 ? cnt : undefined;
  }

  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
    if (value) {
      this.options = this.layer.dataSource
        .options as OgcFilterableDataSourceOptions;
    }
  }
  private _layer;

  @Input() map: IgoMap;

  @Input() color: string = 'primary';

  @Input() header: boolean;

  public ogcFilterCollapse = false;

  constructor() {}

  ngOnInit() {
    this.options = this.layer.dataSource
      .options as OgcFilterableDataSourceOptions;
  }
}
