import { LayerGroupOptions, LayerOptions } from '@igo2/geo';

export const ServiceType = [
  'wms',
  'wmts',
  'arcgisrest',
  'imagearcgisrest',
  'tilearcgisrest'
] as const;
export type ServiceType = (typeof ServiceType)[number];

export enum ServiceTypeEnum {
  wms = 0,
  wmts = 1,
  arcgisrest = 2,
  imagearcgisrest = 3,
  tilearcgisrest = 4
}

export interface ShareOption {
  layerlistControls: { querystring: string };
}

const BaseLayerParamsKeys = [
  'visible',
  'opacity',
  'zIndex',
  'parentId'
] as const;

const LayerParamsKeys = [
  'index',
  'names',
  'type',
  'version',
  'queryString',
  ...BaseLayerParamsKeys
] as const;
type LayerParamsKeys = (typeof LayerParamsKeys)[number];

const GroupParamsKeys = ['title', 'id', ...BaseLayerParamsKeys] as const;
type GroupParamsKeys = (typeof GroupParamsKeys)[number];

const PositionParamsKeys = [
  'center',
  'zoom',
  'rotation',
  'projection'
] as const;
type PositionParamsKeys = (typeof PositionParamsKeys)[number];

export interface ShareMapKeysDefinitions {
  urlsKey: string;
  contextKey: string;
  languageKey: string;
  pos: DefinitionKeyParams<PositionParamsKeys>;
  layers: DefinitionKeyParams<LayerParamsKeys>;
  groups: DefinitionKeyParams<GroupParamsKeys>;
}

export interface DefinitionKeyParams<T extends string> extends BaseKeyParams {
  params: DefinitionParams<T>;
}

export type DefinitionParams<T extends string = string> = Record<
  T,
  BaseKeyParams | undefined
>;

export interface BaseKeyParams {
  key: string;
  parse?: (value: string) => unknown;
  stringify?: (value: unknown) => string;
  regex?: RegExp;
}

export interface PositionParams {
  center: [number, number];
  zoom?: number;
  rotation?: number;
  projection?: string;
}

export interface LayerProperties {
  zIndex: number;
  visibility: boolean;
  type: ServiceType;
  opacity: number;
  parentId: string;
}

export interface UrlParsedParam {
  position: PositionParams;
  layersOptions: LayerOptions[];
  context: string;
}

export type LayerParams = BaseLayerParams & {
  index: number;
  names: string;
  type: string;
  version?: string;
  queryString?: string;
};

export type GroupParams = BaseLayerParams &
  Pick<LayerGroupOptions, 'title' | 'id'>;

type BaseLayerParams = Pick<
  LayerOptions,
  'visible' | 'opacity' | 'zIndex' | 'parentId'
>;
