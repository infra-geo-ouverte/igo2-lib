import { AnyLayerOptions } from './any-layer.interface';
import type { BaseLayerOptions } from './layer.interface';

export interface LayerGroupOptions extends Omit<BaseLayerOptions, 'title'> {
  type: 'group';
  title: string;
  expanded?: boolean;
  children?: AnyLayerOptions[];
}
