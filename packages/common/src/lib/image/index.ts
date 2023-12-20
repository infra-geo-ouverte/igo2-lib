import { ImageErrorDirective } from './image-error.directive';
import { SecureImagePipe } from './secure-image.pipe';

export * from './image-error.directive';
export * from './secure-image.pipe';

export const IMAGE_DIRECTIVES = [SecureImagePipe, ImageErrorDirective] as const;
