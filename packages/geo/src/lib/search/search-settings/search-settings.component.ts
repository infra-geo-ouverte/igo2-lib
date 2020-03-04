import { MatCheckboxChange, MatRadioChange } from '@angular/material';

import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  HostListener,
  Input
} from '@angular/core';

import { SearchSourceService } from '../shared/search-source.service';
import { SearchSource } from '../shared/sources/source';
import {
  SearchSourceSettings,
  SettingOptions
} from '../shared/sources/source.interfaces';
import { sourceCanReverseSearchAsSummary, sourceCanSearch, sourceCanReverseSearch } from '../shared/search.utils';
import { MediaService } from '@igo2/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchSettingsComponent implements OnInit {

  public hasPointerReverseSearchSource: boolean = false;
  public searchSourcesAllEnabled: boolean = false;

  public buffer = [];
  public lastKeyTime = Date.now();

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }

  @Input() pointerSummaryEnabled: boolean = false;

  /**
   * Event emitted when the enabled search source changes
   */
  @Output() searchSourceChange = new EventEmitter<SearchSource>();

  /**
   * Event emitted when the pointer summary is activated
   */
  @Output() pointerSummaryStatus = new EventEmitter<boolean>();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.keyCode === 113) {
      this.pointerSummaryEnabled = !this.pointerSummaryEnabled;
      this.pointerSummaryStatus.emit(this.pointerSummaryEnabled);
    }
  }

  constructor(
    private searchSourceService: SearchSourceService,
    private mediaService: MediaService
    ) {}

  ngOnInit(): void {
    this.hasPointerReverseSearchSource = this.hasReverseSearchSourcesForPointerSummary();
  }

  /**
   * Get all search sources
   * @internal
   */
  getSearchSources(): SearchSource[] {
    const textSearchSources = this.searchSourceService
      .getSources()
      .filter(sourceCanSearch)
      .filter(s => s.available && s.getId() !== 'map' && s.showInSettings);

    const reverseSearchSources = this.searchSourceService
      .getSources()
      .filter(sourceCanReverseSearch)
      .filter(s => s.available && s.getId() !== 'map' && s.showInSettings);
    const sources = textSearchSources.concat(reverseSearchSources);
    this.computeSourcesCheckAllBehavior(sources);
    return sources;
  }

  /**
   * Get all search sources usable for pointer summary
   * @internal
   */
  hasReverseSearchSourcesForPointerSummary(): boolean {
    if (this.searchSourceService.getEnabledSources().filter(sourceCanReverseSearchAsSummary).length) {
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
      if (setting.values.find(settingValue => settingValue.enabled)) {
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
    const enabledSourcesCnt = sources.filter(source => source.enabled).length;
    const disabledSourcesCnt = sources.filter(source => !source.enabled).length;
    this.searchSourcesAllEnabled =  enabledSourcesCnt >= disabledSourcesCnt ? false : true;
  }

  /**
   * Triggered when the check all / uncheck all type is clicked,
   * @internal
   */
  checkUncheckAll(event, source: SearchSource, setting: SearchSourceSettings) {
    event.stopPropagation();
    this.computeSettingCheckAllBehavior(setting);
    setting.values.forEach(settingValue => {
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
    this.getSearchSources().map(source => {
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
    setting.values.forEach(conf => {
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
    this.searchSourceChange.emit(source);
  }

  getAvailableValues(setting: SearchSourceSettings) {
    return setting.values.filter(s => s.available !== false);
  }

  getAvailableHashtagsValues(setting: SettingOptions) {
    if (setting.hashtags) {
      const output: string[] = [];
      for (let value of setting.hashtags) {
        value = '#' + value;
        output.push(value);
      }
      return output;
    }
    return;
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  changePointerReverseSearch(event, fromTitleButton?: boolean) {
    if (fromTitleButton) {
      event.stopPropagation();
      this.pointerSummaryEnabled = !this.pointerSummaryEnabled;
    } else {
      this.pointerSummaryEnabled = event.checked;
    }

    this.pointerSummaryStatus.emit(this.pointerSummaryEnabled);
  }
}
