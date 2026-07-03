import { SearchSource } from './source';
import {
  SearchSourceFeature,
  SearchSourceKind,
  SearchSourceOptions
} from './source.interfaces';
import {
  WORKSPACE_SEARCH_SOURCE_OPTIONS,
  WorkspaceSearchSource
} from './workspace';

/**
 * Workspace search source factory
 * @ignore
 */
export function workspaceSearchSourceFactory() {
  return new WorkspaceSearchSource();
}

/**
 * Function that returns a provider for the Workspace search source
 */
export function provideWorkspaceSearchSource() {
  return {
    provide: SearchSource,
    useFactory: workspaceSearchSourceFactory,
    multi: true
  };
}

export function withWorkspaceSource(
  options?: SearchSourceOptions
): SearchSourceFeature<SearchSourceKind.Workspace> {
  return {
    kind: SearchSourceKind.Workspace,
    providers: [
      provideWorkspaceSearchSource(),
      ...(options
        ? [{ provide: WORKSPACE_SEARCH_SOURCE_OPTIONS, useValue: options }]
        : [])
    ]
  };
}
