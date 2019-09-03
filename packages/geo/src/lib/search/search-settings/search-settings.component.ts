import {MatCheckboxChange, MatRadioChange } from '@angular/material';

import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { SearchSourceService } from '../shared/search-source.service';
import { SearchSource } from '../shared/sources/source';
import { SearchSourceSettings, SettingOptions } from '../shared/sources/source.interfaces';

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

export class SearchSettingsComponent {

  /**
   * Event emitted when the enabled search source changes
   */
  @Output() searchSourceChange = new EventEmitter<SearchSource>();

  constructor(private searchSourceService: SearchSourceService) {}

  /**
   * Get all search sources
   * @internal
   */
  getSearchSources(): SearchSource[] {
    return this.searchSourceService.getSources().filter(s => s.available && s.getId() !== 'map');
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
   * Triggered when a setting is checked (radiobutton style)
   * @internal
   */
  settingsValueCheckedRadioButton(
    event: MatRadioChange,
    source: SearchSource,
    setting: SearchSourceSettings,
    settingValue: SettingOptions
  ) {
    setting.values.forEach( conf => {
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

}
