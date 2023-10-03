import { ImportExportServiceOptions } from '@igo2/geo';
import { ContextServiceOptions } from '../context-manager';
import { AuthOptions } from '@igo2/auth';

export interface ContextOptions {
  auth?: AuthOptions;
  context?: ContextServiceOptions;
  favoriteContext4NonAuthenticated?: boolean;
  importExport?: ImportExportServiceOptions;
}
