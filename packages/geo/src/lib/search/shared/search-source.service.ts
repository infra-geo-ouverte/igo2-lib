import { Workspace } from '@igo2/common';

import { SearchSource } from './sources/source';
import { SearchSourceSettings } from './sources/source.interfaces';

/**
 * Service where all available search sources are registered.
 */
export class SearchSourceService {
  constructor(private sources: SearchSource[]) {}

  /**
   * Return available search sources
   * @returns Search sources
   */
  getSources(): SearchSource[] {
    return this.sources;
  }

  /**
   * Return enabled search sources
   * @returns Search sources
   */
  getEnabledSources(): SearchSource[] {
    return this.getSources().filter(
      (source: SearchSource) => source.enabled === true
    );
  }

  /**
   * Enable search sources of given type
   * @param type Search type
   * @todo It would be better to track the enabled search sources
   *  without updating their 'enabled' property.
   */
  enableSourcesByType(type: string) {
    this.getSources().forEach((source: SearchSource) => {
      if ((source.constructor as typeof SearchSource).type === type) {
        source.enabled = true;
      } else {
        source.enabled = false;
      }
    });
  }

  /**
   * Set Param from the selected settings
   * @param source search-source
   * @param setting settings
   */
  setParamFromSetting(source: SearchSource, setting: SearchSourceSettings) {
    source.setParamFromSetting(setting);
  }

  /**
   * Set Param from the selected settings
   * @param source search-source
   * @param setting settings
   */
  setWorkspaces(source: SearchSource, workspaces: Workspace[]) {
    source.setWorkspaces(workspaces);
  }
}
