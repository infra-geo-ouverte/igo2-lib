import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { SearchSource } from './source';
import { WorkspaceSearchSource } from './workspace';

/**
 * Workspace search source factory
 * @ignore
 */
export function workspaceSearchSourceFactory(
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService
) {
  return new WorkspaceSearchSource(
    languageService,
    storageService,
    config.getConfig(`searchSources.${WorkspaceSearchSource.id}`)
  );
}

/**
 * Function that returns a provider for the Workspace search source
 */
export function provideWorkspaceSearchSource() {
  return {
    provide: SearchSource,
    useFactory: workspaceSearchSourceFactory,
    multi: true,
    deps: [LanguageService, StorageService, ConfigService]
  };
}
