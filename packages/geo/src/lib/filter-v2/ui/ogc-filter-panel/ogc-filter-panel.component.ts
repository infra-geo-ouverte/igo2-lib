import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { OgcFilterStore } from '../../state/ogc-filter.store';
import { OgcFilterRuleComponent } from '../ogc-filter-rule/ogc-filter-rule.component';
import { OgcFilterSelectorComponent } from '../ogc-filter-selector/ogc-filter-selector.component';

/**
 * Thin orchestration component: renders either the selector presentation or
 * the editable rule list of a store. Every mutation is delegated to the
 * store; applying the filter to the source is handled by the
 * `OgcFilterFacade` connection, not by the UI.
 */
@Component({
  selector: 'igo-ogc-filter-panel',
  templateUrl: './ogc-filter-panel.component.html',
  styleUrls: ['./ogc-filter-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    IgoLanguageModule,
    OgcFilterRuleComponent,
    OgcFilterSelectorComponent
  ]
})
export class OgcFilterPanelComponent {
  readonly store = input.required<OgcFilterStore>();

  readonly fields = computed(() => this.store().config.fields ?? []);
}
