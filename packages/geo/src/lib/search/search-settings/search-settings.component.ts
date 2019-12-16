import { MatCheckboxChange, MatRadioChange } from '@angular/material';

import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  HostListener
} from '@angular/core';

import { SearchSourceService } from '../shared/search-source.service';
import { SearchSource } from '../shared/sources/source';
import {
  SearchSourceSettings,
  SettingOptions
} from '../shared/sources/source.interfaces';
import { sourceCanReverseSearchAsSummary, sourceCanSearch, sourceCanReverseSearch } from '../shared/search.utils';

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

  public pointerReverseSearchEnabled: boolean = false;
  public hasPointerReverseSearchSource: boolean = false;

  public buffer = [];
  public lastKeyTime = Date.now();

  /**
   * Event emitted when the enabled search source changes
   */
  @Output() searchSourceChange = new EventEmitter<SearchSource>();

  /**
   * Event emitted when the pointer summary is activated
   */
  @Output() pointerSummaryEnabled = new EventEmitter<boolean>();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
      if (event.keyCode !== 17) { return; }
        const currentTime = Date.now();
        if (currentTime - this.lastKeyTime > 1000 || this.buffer.length >= 2) {
          this.buffer = [];
      }
      this.buffer.push('17');
      this.lastKeyTime = currentTime;
      if (this.buffer.length > 1) {
        this.pointerReverseSearchEnabled = !this.pointerReverseSearchEnabled
        this.pointerSummaryEnabled.emit(this.pointerReverseSearchEnabled)
      }
  }

  constructor(private searchSourceService: SearchSourceService) {}

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
    return textSearchSources.concat(reverseSearchSources);
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
   * Defining the action to do for check/uncheck checkboxes
   * return true if all checkbox must be checked
   * return false if all checkbox must be unchecked
   * @internal
   */
  computeCheckAllBehavior(setting: SearchSourceSettings) {
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
   * Triggered when the check all / uncheck all type is clicked,
   * @internal
   */
  checkUncheckAll(event, source: SearchSource, setting: SearchSourceSettings) {
    event.stopPropagation();
    this.computeCheckAllBehavior(setting);
    setting.values.forEach(settingValue => {
      settingValue.enabled = setting.allEnabled;
    });
    source.setParamFromSetting(setting);
    this.searchSourceChange.emit(source);
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

  stopPropagation(event) {
    event.stopPropagation();
  }

  changePointerReverseSearch(event, fromTitleButton?: boolean) {
    if (fromTitleButton) {
      event.stopPropagation();
      this.pointerReverseSearchEnabled = !this.pointerReverseSearchEnabled;
    } else {
      this.pointerReverseSearchEnabled = event.checked;
    }

    this.pointerSummaryEnabled.emit(this.pointerReverseSearchEnabled);
  }
}
