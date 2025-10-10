import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';
import { WorkspaceSearchSource } from './workspace';

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

export function withWorkspaceSource(): SearchSourceFeature<SearchSourceKind.Workspace> {
  return {
    kind: SearchSourceKind.Workspace,
    providers: [provideWorkspaceSearchSource()]
  };
}
