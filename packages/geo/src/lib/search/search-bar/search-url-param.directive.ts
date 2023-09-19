import {
  Directive,
  Self,
  OnInit,
  Optional,
  ChangeDetectorRef
} from '@angular/core';

import { RouteService } from '@igo2/core';

import { SearchBarComponent } from './search-bar.component';

@Directive({
  selector: '[igoSearchUrlParam]'
})
export class SearchUrlParamDirective implements OnInit {
  constructor(
    @Self() private component: SearchBarComponent,
    private ref: ChangeDetectorRef,
    @Optional() private route: RouteService
  ) {}

  ngOnInit() {
    if (this.route && this.route.options.searchKey) {
      this.route.queryParams.subscribe((params) => {
        const searchParams = params[this.route.options.searchKey as string];
        if (searchParams) {
          this.component.setTerm(searchParams);
          this.ref.detectChanges();
        }
      });
    }
  }
}
