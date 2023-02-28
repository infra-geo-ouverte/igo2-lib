import { NgModule, ModuleWithProviders } from '@angular/core';
import { IgoStyleListModule } from './style-list/style-list.module';
import { StyleService } from './style-service/style.service';

@NgModule({
  imports: [
    IgoStyleListModule.forRoot()
  ],
  exports: [IgoStyleListModule],
  declarations: []
})
export class IgoStyleModule {
  static forRoot(): ModuleWithProviders<IgoStyleModule> {
    return {
      ngModule: IgoStyleModule,
      providers: [StyleService]
    };
  }
}
