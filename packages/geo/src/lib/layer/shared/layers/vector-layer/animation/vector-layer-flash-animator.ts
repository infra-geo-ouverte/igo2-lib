import OlFeature from 'ol/Feature';
import { unByKey } from 'ol/Observable';
import { asArray as colorAsArray } from 'ol/color';
import { easeOut } from 'ol/easing';
import { EventsKey } from 'ol/events';
import olLayerVector from 'ol/layer/Vector';
import { getVectorContext } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import olSourceVector from 'ol/source/Vector';
import RegularShape from 'ol/style/RegularShape';
import Style from 'ol/style/Style';

import { VectorAnimation } from '../vector-layer.interface';

export class VectorLayerFlashAnimator {
  private readonly listenerKeys = new Set<EventsKey>();

  constructor(
    private readonly layer: olLayerVector<olSourceVector>,
    private readonly render: () => void
  ) {}

  flash(feature: OlFeature, options: VectorAnimation): void {
    const start = Date.now();
    const duration = options.duration ?? 1000;

    const animate = (event: RenderEvent) => {
      if (!event.frameState) {
        return;
      }

      const elapsed = event.frameState.time - start;
      const elapsedRatio = elapsed / duration;
      const style = this.resolveRenderableStyle(
        feature,
        event.frameState.viewState.resolution
      );

      if (style) {
        const styleClone = style.clone();
        this.updateStyle(
          styleClone,
          feature.getGeometry()?.getType(),
          elapsedRatio,
          options
        );

        const geometry = feature.getGeometry()?.clone();
        if (geometry) {
          const vectorContext = getVectorContext(event);
          vectorContext.setStyle(styleClone);
          vectorContext.drawGeometry(geometry);
        }
      }

      if (elapsed > duration) {
        this.removeListener(listenerKey);
      }
      this.render();
    };

    const listenerKey = this.layer.on('postrender', animate);
    this.listenerKeys.add(listenerKey);
  }

  destroy(): void {
    unByKey([...this.listenerKeys]);
    this.listenerKeys.clear();
  }

  private updateStyle(
    style: Style,
    geometryType: string | undefined,
    elapsedRatio: number,
    options: VectorAnimation
  ): void {
    const opacity = easeOut(1 - elapsedRatio);
    const color = [...colorAsArray(options.color ?? [255, 0, 0, 1])];
    color[3] = opacity;
    const image = style.getImage();

    if (geometryType === 'Point' && image instanceof RegularShape) {
      image.setRadius(easeOut(elapsedRatio) * image.getRadius() * 3);
      image.setOpacity(opacity);
      return;
    }

    if (geometryType === 'LineString') {
      if (image instanceof RegularShape) {
        const imageStroke = image.getStroke();
        if (imageStroke) {
          imageStroke.setColor(color);
          imageStroke.setWidth(
            easeOut(elapsedRatio) * (imageStroke.getWidth() ?? 1) * 3
          );
        }
      }

      const stroke = style.getStroke();
      if (stroke) {
        stroke.setColor(color);
        stroke.setWidth(easeOut(elapsedRatio) * (stroke.getWidth() ?? 1) * 3);
      }
      return;
    }

    if (geometryType === 'Polygon') {
      if (image instanceof RegularShape) {
        image.getFill()?.setColor(color);
      }
      style.getFill()?.setColor(color);
    }
  }

  private resolveRenderableStyle(
    feature: OlFeature,
    resolution: number
  ): Style | undefined {
    const styleResult = this.layer.getStyleFunction()?.(feature, resolution);
    if (!styleResult) {
      return undefined;
    }

    const styles = Array.isArray(styleResult) ? styleResult : [styleResult];
    return styles.find((style) => !!style.getImage()) ?? styles[0];
  }

  private removeListener(listenerKey: EventsKey): void {
    unByKey(listenerKey);
    this.listenerKeys.delete(listenerKey);
  }
}
