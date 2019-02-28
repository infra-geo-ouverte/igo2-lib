import olSourceVector from 'ol/source/Vector';
import olFeature from 'ol/Feature';
import olFormatFeature from 'ol/format/Feature';

import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WebSocketDataSourceOptions extends FeatureDataSourceOptions {
  onmessage?: 'add'|'delete'|'update';
  onopen?: any;
  onclose?: any;
  onerror?: any;
}
