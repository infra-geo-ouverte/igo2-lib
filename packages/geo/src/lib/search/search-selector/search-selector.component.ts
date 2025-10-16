import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  model,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { SearchSourceService } from '../shared/search-source.service';
import { SEARCH_TYPES } from '../shared/search.enums';

/**
 * This component allows a user to select a search type yo enable. In it's
 * current version, only one search type can be selected at once (radio). If
 * this component were to support more than one search source enabled (checkbox),
 * the searchbar component would require a small change to it's
 * placeholder getter. The search source service already supports having
 * more than one search source enabled.
 */
@Component({
  selector: 'igo-search-selector',
  templateUrl: './search-selector.component.html',
  styleUrls: ['./search-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatRadioModule,
    IgoLanguageModule
  ]
})
export class SearchSelectorComponent implements OnInit {
  private searchSourceService = inject(SearchSourceService);

  /**
   * List of available search types
   */
  readonly searchTypes = input<string[]>(SEARCH_TYPES);
  readonly searchType = model<string>(undefined);

  /**
   * Event emitted when the enabled search type changes
   */
  readonly searchTypeChange = output<string>();

  ngOnInit() {
    this.onSetSearchType(this.searchType());
  }

  /**
   * Enable the selected search type
   * @param searchType Search type
   * @internal
   */
  onSearchTypeChange(searchType: string) {
    this.searchType.set(searchType);

    this.onSetSearchType(searchType);
  }

  /**
   * Get a search type's title. The title
   * for all availables search typers needs to be defined in the locale
   * files or an error will be thrown.
   * @param searchType Search type
   * @internal
   */
  getSearchTypeTitle(searchType: string) {
    return `igo.geo.search.${searchType.toLowerCase()}.title`;
  }

  private onSetSearchType(searchType: string) {
    if (searchType === undefined || searchType === null) {
      return;
    }

    this.searchSourceService.enableSourcesByType(searchType);
    this.searchTypeChange.emit(searchType);
  }
}
