import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule
} from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { MediaService } from '@igo2/core/media';
import { StorageService } from '@igo2/core/storage';

import { SearchSourceService } from '../shared/search-source.service';
import {
  sourceCanReverseSearch,
  sourceCanReverseSearchAsSummary,
  sourceCanSearch
} from '../shared/search.utils';
import { SearchSource } from '../shared/sources/source';
import {
  SearchSourceSettings,
  SettingOptions
} from '../shared/sources/source.interfaces';

/**
 * This component allows a user to select a search type yo enable. In it's
 * current version, only one search type can be selected at once (radio). If
 * this component were to support more than one search source enabled (checkbox),
 * the searchbar component would require a small change to it's
 * placeholder getter. The search source service already supports having
 * more than one search source enabled.
 */
@Component({
  selector: 'igo-search-settings',
  templateUrl: './search-settings.component.html',
  styleUrls: ['./search-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    NgIf,
    NgFor,
    MatCheckboxModule,
    NgSwitch,
    NgSwitchCase,
    MatRadioModule,
    MatDividerModule,
    MatSlideToggleModule,
    IgoLanguageModule
  ]
})
export class SearchSettingsComponent implements OnInit {
  public hasPointerReverseSearchSource = false;
  public searchSourcesAllEnabled = false;

  public buffer = [];
  public lastKeyTime = Date.now();

  public displayBlock = 'block';

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }

  @Input() pointerSummaryEnabled = false;
  @Input() searchResultsGeometryEnabled = false;
  @Input() reverseSearchCoordsFormatEnabled = false;

  /**
   * Event emitted when the enabled search source changes
   */
  @Output() searchSourceChange = new EventEmitter<SearchSource>();

  /**
   * Event emitted when the pointer summary is activated
   */
  @Output() pointerSummaryStatus = new EventEmitter<boolean>();

  /**
   * Event emitted when the show geometry summary is changed
   */
  @Output() searchResultsGeometryStatus = new EventEmitter<boolean>();

  /**
   * Event emitted when the coords format is changed
   */
  @Output() reverseSearchCoordsFormatStatus = new EventEmitter<boolean>();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F2') {
      this.pointerSummaryEnabled = !this.pointerSummaryEnabled;
      this.pointerSummaryStatus.emit(this.pointerSummaryEnabled);
    }
  }

  constructor(
    private searchSourceService: SearchSourceService,
    private mediaService: MediaService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.hasPointerReverseSearchSource =
      this.hasReverseSearchSourcesForPointerSummary();
  }

  /**
   * Get all search sources
   * @internal
   */
  getSearchSources(): SearchSource[] {
    const textSearchSources = this.searchSourceService
      .getSources()
      .filter(sourceCanSearch)
      .filter((s) => s.available && s.getId() !== 'map' && s.showInSettings);

    const reverseSearchSources = this.searchSourceService
      .getSources()
      .filter(sourceCanReverseSearch)
      .filter((s) => s.available && s.getId() !== 'map' && s.showInSettings);
    const sources = textSearchSources.concat(reverseSearchSources);
    this.computeSourcesCheckAllBehavior(sources);
    return sources;
  }

  /**
   * Get all search sources usable for pointer summary
   * @internal
   */
  hasReverseSearchSourcesForPointerSummary(): boolean {
    if (
      this.searchSourceService
        .getEnabledSources()
        .filter(sourceCanReverseSearchAsSummary).length
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Triggered when a setting is checked (checkbox style)
   * @internal
   */
  settingsValueCheckedCheckbox(
    event: MatCheckboxChange,
    source: SearchSource,
    setting: SearchSourceSettings,
    settingValue: SettingOptions
  ) {
    settingValue.enabled = event.checked;
    source.setParamFromSetting(setting);
    this.searchSourceChange.emit(source);
  }

  /**
   * Defining the action to do for check/uncheck checkboxes (settings)
   * return true if all checkbox must be checked
   * return false if all checkbox must be unchecked
   * @internal
   */
  computeSettingCheckAllBehavior(setting: SearchSourceSettings) {
    if (setting.allEnabled === undefined) {
      if (setting.values.find((settingValue) => settingValue.enabled)) {
        setting.allEnabled = false;
      } else {
        setting.allEnabled = true;
      }
    } else {
      setting.allEnabled = !setting.allEnabled;
    }
  }

  /**
   * Defining the action to do for check/uncheck checkboxes (sources)
   * return true if all checkbox must be checked
   * return false if all checkbox must be unchecked
   * @internal
   */
  computeSourcesCheckAllBehavior(sources: SearchSource[]) {
    const enabledSourcesCnt = sources.filter((source) => source.enabled).length;
    const disabledSourcesCnt = sources.filter(
      (source) => !source.enabled
    ).length;
    this.searchSourcesAllEnabled =
      enabledSourcesCnt >= disabledSourcesCnt ? false : true;
  }

  /**
   * Triggered when the check all / uncheck all type is clicked,
   * @internal
   */
  checkUncheckAll(event, source: SearchSource, setting: SearchSourceSettings) {
    event.stopPropagation();
    this.computeSettingCheckAllBehavior(setting);
    setting.values.forEach((settingValue) => {
      settingValue.enabled = setting.allEnabled;
    });
    source.setParamFromSetting(setting);
    this.searchSourceChange.emit(source);
  }

  /**
   * Triggered when the check all / uncheck all type is clicked,
   * @internal
   */
  checkUncheckAllSources(event) {
    event.stopPropagation();
    this.getSearchSources().map((source) => {
      source.enabled = this.searchSourcesAllEnabled;
      this.searchSourceChange.emit(source);
    });
  }

  /**
   * Triggered when a setting is checked (radiobutton style)
   * @internal
   */
  settingsValueCheckedRadioButton(
    event: MatRadioChange,
    source: SearchSource,
    setting: SearchSourceSettings,
    settingValue: SettingOptions
  ) {
    setting.values.forEach((conf) => {
      if (conf.value !== settingValue.value) {
        conf.enabled = !event.source.checked;
      } else {
        conf.enabled = event.source.checked;
      }
    });
    source.setParamFromSetting(setting);
    this.searchSourceChange.emit(source);
  }

  onCheckSearchSource(event: MatCheckboxChange, source: SearchSource) {
    source.enabled = event.checked;
    const storage = (this.storageService.get(source.getId() + '.options') ||
      {}) as SettingOptions;
    storage.enabled = source.enabled;
    this.storageService.set(source.getId() + '.options', storage);
    this.searchSourceChange.emit(source);
  }

  getAvailableValues(setting: SearchSourceSettings) {
    return setting.values.filter((s) => s.available !== false);
  }

  getAvailableHashtagsValues(setting: SettingOptions) {
    if (setting.hashtags) {
      return setting.hashtags.map((h) => '#' + h).join(', ');
    }
    return;
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  changePointerReverseSearch(event) {
    this.pointerSummaryEnabled = event.checked;
    this.pointerSummaryStatus.emit(this.pointerSummaryEnabled);
  }

  changeSearchResultsGeometry(event) {
    this.searchResultsGeometryEnabled = event.checked;
    this.searchResultsGeometryStatus.emit(this.searchResultsGeometryEnabled);
  }

  reverseSearchCoordsFormat(event) {
    this.reverseSearchCoordsFormatEnabled = event.checked;
    this.reverseSearchCoordsFormatStatus.emit(
      this.reverseSearchCoordsFormatEnabled
    );
  }
}
