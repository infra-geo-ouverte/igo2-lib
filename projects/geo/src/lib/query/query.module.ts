import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QueryDirective } from './shared/query.directive';
import { QueryService } from './shared/query.service';

@NgModule({
  imports: [CommonModule],
  exports: [QueryDirective],
  declarations: [QueryDirective],
  providers: [QueryService]
})
export class IgoQueryModule {}
