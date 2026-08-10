import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { VectorSourceEvent } from 'ol/source/Vector';

import type { LayerExtension } from '../../extension/layer-extension.interface';
import type {
  VectorLayerExtensionContext,
  VectorLayerExtensionInstance
} from '../vector-layer-extension.interface';
import type { VectorLayerOptions } from '../vector-layer.interface';
import { VectorLayerFlashAnimator } from './vector-layer-flash-animator';

interface VectorLayerAnimationExtensionInstance extends VectorLayerExtensionInstance {
  stopAnimation(): void;
}

export const vectorLayerAnimationExtension: LayerExtension<
  VectorLayerOptions,
  VectorLayerExtensionContext,
  VectorLayerAnimationExtensionInstance
> = {
  id: 'vector-animation',

  supports: (options) => options.animation !== undefined,

  attach: (
    context: VectorLayerExtensionContext
  ): VectorLayerAnimationExtensionInstance => {
    const animator = new VectorLayerFlashAnimator(
      context.layer,
      context.requestRender
    );
    let listenerKey: EventsKey | undefined = context.source.on(
      'addfeature',
      (event: VectorSourceEvent) => {
        if (event.feature && context.options.animation) {
          animator.flash(event.feature, context.options.animation);
        }
      }
    );

    const stopAnimation = () => {
      if (listenerKey) {
        unByKey(listenerKey);
        listenerKey = undefined;
      }
    };

    return {
      stopAnimation,
      destroy: () => {
        stopAnimation();
        animator.destroy();
      }
    };
  }
};
