import {
  MetadataAbstractComponent,
  MetadataButtonComponent
} from './metadata-button';

export * from './shared';
export * from './metadata-button';

export const METADATA_DIRECTIVES = [
  MetadataButtonComponent,
  MetadataAbstractComponent
] as const;
