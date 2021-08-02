import olSourceVector from 'ol/source/Vector';
import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olformat from 'ol/format';
import { unByKey } from 'ol/Observable';
import { easeOut } from 'ol/easing';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';
import { FeatureDataSource } from './feature-datasource';
import { WebSocketDataSourceOptions } from './websocket-datasource.interface';

export class WebSocketDataSource extends FeatureDataSource {
  public ws: WebSocket;
  public options: WebSocketDataSourceOptions;

  protected createOlSource(): olSourceVector<OlGeometry> {
    this.createWebSocket();
    this.options.format = this.getSourceFormatFromOptions(this.options);
    return super.createOlSource();
  }

  private createWebSocket() {
    this.ws = new WebSocket(this.options.url);
    this.ws.onmessage = this.onMessage.bind(this);

    if (this.options.onclose) {
      this.ws.onclose = this.onClose.bind(this);
    }

    if (this.options.onerror) {
      this.ws.onerror = this.onError.bind(this);
    }

    if (this.options.onopen) {
      this.ws.onopen = this.onOpen.bind(this);
    }
  }

  onMessage(event) {
    const featureAdded = this.options.format.readFeature(event.data) as olFeature<OlGeometry>;

    switch (this.options.onmessage) {
      case 'update':
        // ol don't add if same ID
        const featureToRemove = this.ol.getFeatureById(featureAdded.getId());
        if (featureToRemove) {
          this.ol.removeFeature(featureToRemove);
        }
        this.ol.addFeature(featureAdded);
        break;
      case 'delete':
        this.ol.clear(true);
        this.ol.addFeature(featureAdded);
        break;
      case 'add':
      default:
        this.ol.addFeature(featureAdded);
    }
  }

  onClose(event) {
    // thrown message to user
  }

  onError(event) {
    // thrown message to user
  }

  onOpen(event) {
    // thrown message to user ?
  }

  public onUnwatch() {
    this.ws.close();
  }
}
