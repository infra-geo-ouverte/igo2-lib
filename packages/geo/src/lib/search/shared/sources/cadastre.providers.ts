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
 */
export function provideCadastreSearchSource() {
  return {
    provide: SearchSource,
    useFactory: cadastreSearchSourceFactory,
    multi: true
  };
}

export function withCadastreSource(): SearchSourceFeature<SearchSourceKind.Cadastre> {
  return {
    kind: SearchSourceKind.Cadastre,
    providers: [provideCadastreSearchSource()]
  };
}
