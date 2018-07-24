import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
} from '@angular/material';

import { SearchService } from './shared/search.service';
import { provideSearchSourceService } from './shared/search-source.service';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchUrlParamDirective } from './search-bar/search-url-param.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  exports: [SearchBarComponent, SearchUrlParamDirective],
  declarations: [SearchBarComponent, SearchUrlParamDirective]
})
export class IgoSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSearchModule,
      providers: [provideSearchSourceService(), SearchService]
    };
  }
}
