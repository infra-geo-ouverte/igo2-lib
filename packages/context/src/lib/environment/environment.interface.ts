import { AuthOptions } from '@igo2/auth';
import { ImportExportServiceOptions } from '@igo2/geo';

import { ContextServiceOptions } from '../context-manager';

export interface EnvironmentOptions {
  auth?: AuthOptions;
  context?: ContextServiceOptions;
  favoriteContext4NonAuthenticated?: boolean;
  importExport?: ImportExportServiceOptions;
}
