import olSourceVector from 'ol/source/Vector';
import * as olformat from 'ol/format';
import {unByKey} from 'ol/Observable';
import {easeOut} from 'ol/easing';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';

import { Md5 } from 'ts-md5';

import { SubjectStatus } from '@igo2/utils';
import { uuid } from '@igo2/utils';
import { FeatureDataSource } from './feature-datasource';
import { WebSocketDataSourceOptions } from './websocket-datasource.interface';

export class WebSocketDataSource extends FeatureDataSource {
  public ws: WebSocket;
  public options: WebSocketDataSourceOptions;

  constructor(options: WebSocketDataSourceOptions) {
    super(options);
  }

  protected createOlSource(): olSourceVector {
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

    const featureAdded = this.options.format.readFeature(event.data);

    switch (this.options.onmessage) {
      case 'update':
        // ol don't add if same ID
        this.ol.removeFeature(this.ol.getFeatureById(featureAdded.id));
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

  onLayerStatusChange(status: SubjectStatus): void {
    switch (status) {
      case 1:
      case 2:
      case 3:
        // nothing to do
        break;
      case 4:
        this.ws.close();
        break;
    }
  }
}
