import { Observable } from 'rxjs';

import { WMSDataSourceOptions } from '../datasources';

export abstract class OptionsService {
  abstract getWMSOptions(
    _baseOptions: WMSDataSourceOptions
  ): Observable<WMSDataSourceOptions>;
}
