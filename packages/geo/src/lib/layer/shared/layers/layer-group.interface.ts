import { AnyLayerOptions } from './any-layer.interface';
import type { LayerOptionsBase } from './layer.interface';

export interface LayerGroupOptions extends Omit<LayerOptionsBase, 'title'> {
  type: 'group';
  title: string;
  expanded?: boolean;
  children?: AnyLayerOptions[];
}
