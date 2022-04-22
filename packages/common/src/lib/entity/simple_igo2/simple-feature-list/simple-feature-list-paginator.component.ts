import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'igo-simple-feature-list-paginator',
  templateUrl: './simple-feature-list-paginator.component.html',
  styleUrls: ['./simple-feature-list-paginator.component.scss']
})
export class SimpleFeatureListPaginatorComponent implements OnInit, OnDestroy {
  @Input() pageSize: number;
  @Input() numberOfPages: number;
  @Input() showFirstLastPageButtons: boolean;
  @Input() showPreviousNextPageButtons: boolean;
  @Output() pageChange = new EventEmitter();

  public currentPage$: BehaviorSubject<number> = new BehaviorSubject(1);
  public pageChange$$: Subscription;
  public currentPageIsFirst: boolean = true;
  public currentPageIsLast: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.pageChange$$ = this.currentPage$.subscribe(() => {
      if (this.currentPage$.getValue() === this.numberOfPages) {
        this.currentPageIsFirst = false;
        this.currentPageIsLast = true;
      } else if (this.currentPage$.getValue() === 1) {
        this.currentPageIsFirst = true;
        this.currentPageIsLast = false;
      } else {
        this.currentPageIsFirst = false;
        this.currentPageIsLast = false;
      }

      this.pageChange.emit(this.currentPage$.getValue());
    });
  }

  ngOnDestroy() {
    this.pageChange$$.unsubscribe();
  }

  goToFirstPage() {
    this.currentPage$.next(1);
  }

  goToPreviousPage() {
    this.currentPage$.next(this.currentPage$.getValue() - 1);
  }

  goToPage(event: any) {
    this.currentPage$.next(parseInt(event.target.innerText));
  }

  goToNextPage() {
    this.currentPage$.next(this.currentPage$.getValue() + 1);
  }

  goToLastPage() {
    this.currentPage$.next(this.numberOfPages);
  }
}
