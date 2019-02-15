import olSourceVector from 'ol/source/Vector';
import * as olformat from 'ol/format';

import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';
import { FeatureDataSource } from './feature-datasource';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export class WebSocketDataSource extends FeatureDataSource {
  public ws: WebSocket;
  public duration = 3000;


  protected createOlSource(): olSourceVector {
     this.createWebSocket();
     this.options.format = this.getSourceFormatFromOptions(this.options);
     return super.createOlSource();
  }

  private createWebSocket() {
    this.ws = new WebSocket(this.options.url);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
  }

  onMessage(event) {
    this.ol.addFeature(this.options.format.readFeature(event.data));
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



}
