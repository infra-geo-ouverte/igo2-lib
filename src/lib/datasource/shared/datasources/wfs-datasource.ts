import { FeatureDataSource } from './feature-datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';


export class WFSDataSource extends FeatureDataSource {

  public options: WFSDataSourceOptions;

  constructor(options: WFSDataSourceOptions) {
    if (!options.formatType) {
      options.formatType = 'WFS';
    }

    super(options);
  }
}
