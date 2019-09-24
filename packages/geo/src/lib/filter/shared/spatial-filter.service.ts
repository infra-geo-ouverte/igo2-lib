import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { TileArcGISRestDataSource } from '../../datasource/shared/datasources/tilearcgisrest-datasource';

@Injectable()
export class SpatialFilterService {
  constructor() {}
}
