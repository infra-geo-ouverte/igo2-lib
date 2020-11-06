import { NgModule, ModuleWithProviders } from '@angular/core';
import { SecureImagePipe } from './secure-image.pipe';

@NgModule({
  imports: [],
  declarations: [SecureImagePipe],
  exports: [SecureImagePipe]
})
export class IgoImageModule {
  static forRoot(): ModuleWithProviders<IgoImageModule> {
    return {
      ngModule: IgoImageModule,
      providers: []
    };
  }
}
