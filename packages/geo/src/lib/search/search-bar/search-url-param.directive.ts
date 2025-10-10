import { ChangeDetectorRef, Directive, OnInit, inject } from '@angular/core';

import { RouteService } from '@igo2/core/route';

import { SearchBarComponent } from './search-bar.component';

@Directive({
  selector: '[igoSearchUrlParam]',
  standalone: true
})
export class SearchUrlParamDirective implements OnInit {
  private component = inject(SearchBarComponent, { self: true });
  private ref = inject(ChangeDetectorRef);
  private route = inject(RouteService, { optional: true });

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
