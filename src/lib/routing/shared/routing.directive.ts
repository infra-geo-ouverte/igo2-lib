// import { Directive, Input, Output, EventEmitter,
//          OnDestroy } from '@angular/core';

// import { Subscription } from 'rxjs/Subscription';
// import { Observable } from 'rxjs/Observable';
// import { forkJoin } from 'rxjs/observable/forkJoin';


// import { Feature } from '../../feature';

// import { SearchService } from '../shared/search.service';


// @Directive({
//   selector: '[igoSearch]'
// })
// export class QueryDirective implements OnDestroy {

//   private searchTerm: string;
//   private searches$$: Subscription[] = [];


//   @Input()
//   get waitForAllSearches(): boolean { return this._waitForAllSearches; }
//   set waitForAllSearches(value: boolean) {
//     this._waitForAllSearches = value;
//   }
//   private _waitForAllSearches: boolean = false;

//   @Output() query = new EventEmitter<{
//     features: Feature[] | Feature[][]
//    // ,event: ol.MapBrowserEvent
//   }>();

//   constructor(private searchService: SearchService) {}

//   ngOnDestroy() {
//     this.unsubscribeSearches();
//   }

//   // private handleLayersChange(layers: Layer[]) {
//   //   const searchTerm = [];
//   //   layers.forEach(layer => {
//   //     if (layer.dataSource.isQueryable()) {
//   //       searchTerm.push(layer);
//   //     }
//   //   });

//   //   this.searchTerm = searchTerm;
//   // }

//   // public handleMapClick(event: ol.MapBrowserEvent) {
//   //   this.unsubscribeSearches();

//   //   const searches$ = this.searchService.search(this.searchTerm);

//   //   if (this.waitForAllSearches) {
//   //     this.searches$$.push(
//   //       forkJoin(...searches$).subscribe(
//   //         (features: Feature[][]) => this.query.emit({features: features, event: event})
//   //       )
//   //     );
//   //   } else {
//   //     this.searches$$ = searches$.map((query$: Observable<Feature[]>) => {
//   //       return query$.subscribe(
//   //         (features: Feature[]) => this.query.emit({features: features, event: event})
//   //       );
//   //     });
//   //   }
//   // }

//   private unsubscribeSearches() {
//     this.searches$$.forEach((sub: Subscription) => sub.unsubscribe());
//     this.searches$$ = [];
//   }
// }
