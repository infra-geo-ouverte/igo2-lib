import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'igo-simple-feature-list-paginator',
  templateUrl: './simple-feature-list-paginator.component.html',
  styleUrls: ['./simple-feature-list-paginator.component.scss']
})
export class SimpleFeatureListPaginatorComponent implements OnInit, OnDestroy {
  @Input() pageSize: number; // the number of elements per page
  @Input() numberOfPages: number; // the calculated number of pages necessary to display all the elements
  @Input() showFirstLastPageButtons: boolean; // boolean representing whether to display the First page and Last page buttons or not
  @Input() showPreviousNextPageButtons: boolean; // boolean representing whether to display the Previous page and Next page buttons or not
  @Output() pageChange = new EventEmitter(); // an event emitted when the user changes the page

  public currentPageNumber$: BehaviorSubject<number> = new BehaviorSubject(1); // an observable containing the current page number
  public pageChange$$: Subscription; // a subscription to a page change
  public currentPageIsFirst: boolean = true; // boolean representing whether the current page is the first one or not
  public currentPageIsLast: boolean = false; // boolean representingwhether the current page is the last one or not

  constructor() {}

  ngOnInit(): void {
    // subscribe to a page change made by the user
    this.pageChange$$ = this.currentPageNumber$.subscribe((currentPageNumber: number) => {
      // if current page is the last one...
      if (currentPageNumber === this.numberOfPages) {
        this.currentPageIsFirst = false;
        this.currentPageIsLast = true;
      // if current page is the first one...
      } else if (currentPageNumber === 1) {
        this.currentPageIsFirst = true;
        this.currentPageIsLast = false;
      // if current page is neither the first nor the last one...
      } else {
        this.currentPageIsFirst = false;
        this.currentPageIsLast = false;
      }
      // emit the current page number to parent component
      this.pageChange.emit(currentPageNumber);
    });
  }

  ngOnDestroy() {
    this.pageChange$$.unsubscribe();
  }

  /**
   * @description Fired when the First page button is clicked
   */
  goToFirstPage() {
    // set current page number to first (1)
    this.currentPageNumber$.next(1);
  }

  /**
   * @description Fired when the Previous page button is clicked
   */
  goToPreviousPage() {
    // set current page number to previous (- 1)
    this.currentPageNumber$.next(this.currentPageNumber$.getValue() - 1);
  }

  /**
   * @description Fired when a specific page is selected
   * @param event
   */
  goToPage(event: any) {
    // set current page number to selected button
    this.currentPageNumber$.next(parseInt(event.target.innerText));
  }

  /**
   * @description Fired when the Next page button is clicked
   */
  goToNextPage() {
    // set current page number to next (+ 1)
    this.currentPageNumber$.next(this.currentPageNumber$.getValue() + 1);
  }

  /**
   * @description Fired when the Last page button is clicked
   */
  goToLastPage() {
    // set current page number to last
    this.currentPageNumber$.next(this.numberOfPages);
  }
}
