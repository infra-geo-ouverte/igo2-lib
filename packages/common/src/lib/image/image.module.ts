import { NgModule, ModuleWithProviders } from '@angular/core';
import { ImageErrorDirective } from './image-error.directive';
import { SecureImagePipe } from './secure-image.pipe';

@NgModule({
  imports: [],
  declarations: [SecureImagePipe, ImageErrorDirective],
  exports: [SecureImagePipe, ImageErrorDirective]
})
export class IgoImageModule {
  static forRoot(): ModuleWithProviders<IgoImageModule> {
    return {
      ngModule: IgoImageModule,
      providers: []
    };
  }
}
