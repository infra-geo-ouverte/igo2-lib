import { SearchBarComponent } from './search-bar/search-bar.component';
import { SEARCH_RESULTS_DIRECTIVES } from './search-results';
import { SearchSelectorComponent } from './search-selector/search-selector.component';
import { SearchSettingsComponent } from './search-settings/search-settings.component';
import { SearchPointerSummaryDirective } from './shared';

export * from './shared';
export * from './search-selector/search-selector.component';
export * from './search-selector/search-selector.module';
export * from './search-settings/search-settings.component';
export * from './search-settings/search-settings.module';
export * from './search-bar/search-bar.component';
export * from './search-bar/search-bar.module';
export * from './search-results';

export const SEARCH_DIRECTIVES = [
  SearchBarComponent,
  SearchSelectorComponent,
  ...SEARCH_RESULTS_DIRECTIVES,
  SearchSettingsComponent,
  SearchPointerSummaryDirective
] as const;
