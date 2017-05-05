import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { SearchBarComponent } from './search-bar.component';


@Directive({
  selector: '[igoSearchUrlParam]'
})
export class SearchUrlParamDirective implements OnInit, OnDestroy {

  private queryParams$$: Subscription;

  constructor(@Self() private component: SearchBarComponent,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.queryParams$$ = this.route.queryParams
      .subscribe(params => {
        if (params['search']) {
          this.component.setTerm(params['search']);
        }
      });
  }

  ngOnDestroy() {
    this.queryParams$$.unsubscribe();
  }

}
