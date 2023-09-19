import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WebSocketDataSourceOptions extends FeatureDataSourceOptions {
  onmessage?: 'add' | 'delete' | 'update';
  onopen?: any;
  onclose?: any;
  onerror?: any;
}
