import olSourceVector from 'ol/source/Vector';
import * as olformat from 'ol/format';

import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';
import { FeatureDataSource } from './feature-datasource';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export class WebSocketDataSource extends FeatureDataSource {
  public ws: WebSocket;
  
  protected createOlSource(): olSourceVector {
     this.createWebSocket();
     return super.createOlSource();
  }

  private createWebSocket() {
    this.ws = new WebSocket(this.options.url);
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
    this.ws.onerror = this.onError;
    this.ws.onopen = this.onOpen;
  }
   
  onMessage(event) {
    console.log(event.data);
  }

  onClose(event) {

  }

  onError(event) {

  }

  onOpen(event) {

  }



}
