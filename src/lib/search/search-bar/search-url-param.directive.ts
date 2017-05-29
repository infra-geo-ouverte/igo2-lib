import { Directive, Self, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SearchBarComponent } from './search-bar.component';


@Directive({
  selector: '[igoSearchUrlParam]'
})
export class SearchUrlParamDirective implements OnInit {

  constructor(@Self() private component: SearchBarComponent,
              private route: ActivatedRoute,
              private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.component.setTerm(params['search']);
        this.ref.detectChanges();
      }
    });
  }

}
