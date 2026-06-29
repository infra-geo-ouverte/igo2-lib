import { CadastreSearchSource } from './cadastre';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

/**
 * Cadastre search source factory
 * @ignore
 */
export function cadastreSearchSourceFactory() {
  return new CadastreSearchSource();
}

/**
 * Function that returns a provider for the Cadastre search source
 * @deprecated This search source is deprecated and will be removed in a future major version, likely in 23.x+. As an alternative, provide iCherche. Within icherche, you could use the "cadastre type"
 */
export function provideCadastreSearchSource() {
  return {
    provide: SearchSource,
    useFactory: cadastreSearchSourceFactory,
    multi: true
  };
}

/**
 * @deprecated This search source is deprecated and will be removed in a future major version, likely in 23.x+.
 */
export function withCadastreSource(): SearchSourceFeature<SearchSourceKind.Cadastre> {
  return {
    kind: SearchSourceKind.Cadastre,
    providers: [provideCadastreSearchSource()]
  };
}
