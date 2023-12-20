import { AsyncPipe, NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatRadioModule,
    NgFor,
    AsyncPipe,
    TranslateModule
  ]
})
export class SearchSelectorComponent implements OnInit, OnDestroy {
  readonly searchType$: BehaviorSubject<string> = new BehaviorSubject(
    undefined
  );

  /**
   * Subscription to the search type
   */
  private searchType$$: Subscription;

  /**
   * List of available search types
   */
  @Input() searchTypes: string[] = SEARCH_TYPES;

  /**
   * The search type enabled
   */
  @Input()
  set searchType(value: string) {
    this.setSearchType(value);
  }
  get searchType(): string {
    return this.searchType$.value;
  }

  /**
   * Event emitted when the enabled search type changes
   */
  @Output() searchTypeChange = new EventEmitter<string>();

  constructor(private searchSourceService: SearchSourceService) {}

  ngOnInit() {
    this.searchType$$ = this.searchType$
      .pipe(distinctUntilChanged())
      .subscribe((searchType: string) => this.onSetSearchType(searchType));
  }

  ngOnDestroy() {
    this.searchType$$.unsubscribe();
  }

  /**
   * Enable the selected search type
   * @param searchType Search type
   * @internal
   */
  onSearchTypeChange(searchType: string) {
    this.setSearchType(searchType);
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

  /**
   * Emit an event and enable the search sources of the given type.
   * @param searchType Search type
   */
  private setSearchType(searchType: string | undefined) {
    this.searchType$.next(searchType);
  }

  private onSetSearchType(searchType: string) {
    if (searchType === undefined || searchType === null) {
      return;
    }

    this.searchSourceService.enableSourcesByType(searchType);
    this.searchTypeChange.emit(searchType);
  }
}
