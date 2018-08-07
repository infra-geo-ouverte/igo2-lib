import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
} from '@angular/material';

import { provideSearchSourceService } from './shared/search-source.service';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchBarBindingDirective } from './search-bar/search-bar-binding.directive';
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
  exports: [
    HttpClientModule,
    SearchBarComponent,
    SearchUrlParamDirective,
    SearchBarBindingDirective
  ],
  declarations: [
    SearchBarComponent,
    SearchUrlParamDirective,
    SearchBarBindingDirective
  ],
  providers: [provideSearchSourceService()]
})
export class IgoSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSearchModule,
      providers: []
    };
  }
}
