import { Directive, Self, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { SearchBarComponent } from './search-bar.component';


@Directive({
  selector: '[igoSearchUrlParam]'
})
export class SearchUrlParamDirective implements OnInit {

  constructor(@Self() private component: SearchBarComponent,
              private route: ActivatedRoute) {}

  ngOnInit() {
    const queryParams$$ = this.route.queryParams
      .subscribe(params => {
        queryParams$$.unsubscribe();        
        if (params['search']) {
          this.component.setTerm(params['search']);
        }
      });
  }

}
