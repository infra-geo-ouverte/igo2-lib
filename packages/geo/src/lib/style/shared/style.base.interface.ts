import { StyleEngineKind } from './style.enum';

export interface EngineLayerStyle<
  TType extends StyleEngineKind = StyleEngineKind,
  TStyle = unknown
> {
  type: TType;
  style?: TStyle;
}
