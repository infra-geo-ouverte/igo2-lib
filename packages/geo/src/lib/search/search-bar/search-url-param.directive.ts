import {
  ChangeDetectorRef,
  Directive,
  OnInit,
  Optional,
  Self
} from '@angular/core';

import { RouteService } from '@igo2/core';

import { SearchBarComponent } from './search-bar.component';

@Directive({
  selector: '[igoSearchUrlParam]',
  standalone: true
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
