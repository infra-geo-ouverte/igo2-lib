import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit
} from '@angular/core';

import {
  EntityStore
} from '../shared';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LanguageService } from '@igo2/core';
import { EntityTablePaginatorOptions } from './entity-table-paginator.interface';

@Component({
  selector: 'igo-entity-table-paginator',
  templateUrl: './entity-table-paginator.component.html',
  styleUrls: ['./entity-table-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTablePaginatorComponent implements OnInit, OnDestroy, AfterViewInit {

  private entitySortChange$$: Subscription;

  @Input() entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /**
   * Entity store
   */
  @Input() store: EntityStore<object>;

  /**
   * Paginator options
   */
  @Input()
  paginatorOptions: EntityTablePaginatorOptions;

  /**
   * Event emitted when the paginator changes the page size or page index.
   */
  @Output() page: EventEmitter<PageEvent>;

  public length: number = 0;

  /**
   * Paginator emitted.
   */
  @Output() paginatorChange: EventEmitter<MatPaginator> = new EventEmitter<MatPaginator>();

  constructor(private languageService: LanguageService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.store.stateView.count$.subscribe((count) => {
      this.length = count;
      this.emitPaginator();
    });
    this.entitySortChange$$ = this.entitySortChange$.subscribe(() => {
      if (this.paginator) {
        this.paginator.firstPage();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.translateLabels();
    }, 250);
  }
  translateLabels() {
    this.paginator._intl.firstPageLabel =
      this.languageService.translate.instant('igo.common.paginator.firstPageLabel');
    this.paginator._intl.getRangeLabel = this.rangeLabel;
    this.paginator._intl.itemsPerPageLabel =
      this.languageService.translate.instant('igo.common.paginator.itemsPerPageLabel');
    this.paginator._intl.lastPageLabel =
      this.languageService.translate.instant('igo.common.paginator.lastPageLabel');
    this.paginator._intl.nextPageLabel =
      this.languageService.translate.instant('igo.common.paginator.nextPageLabel');
    this.paginator._intl.previousPageLabel =
      this.languageService.translate.instant('igo.common.paginator.previousPageLabel');
  }

  rangeLabel = (page: number, pageSize: number, length: number) => {
    const of =
    this.languageService.translate.instant('igo.common.paginator.of');
    if (length === 0 || pageSize === 0) { return `0 ${of} ${length}`; }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${of} ${length}`;
  }

  ngOnDestroy(): void {
    this.entitySortChange$$.unsubscribe();
  }

  emitPaginator() {
    this.paginatorChange.emit(this.paginator);
  }
}
