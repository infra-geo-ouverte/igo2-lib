import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';

import {
  EntityStore
} from '../shared';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LanguageService, MediaService } from '@igo2/core';
import { EntityTablePaginatorOptions } from './entity-table-paginator.interface';

@Component({
  selector: 'igo-entity-table-paginator',
  templateUrl: './entity-table-paginator.component.html',
  styleUrls: ['./entity-table-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTablePaginatorComponent implements OnChanges, OnDestroy {

  public disabled: boolean = false;
  public hidePageSize: boolean = false;
  public pageIndex: number = 0;
  public pageSize: number = 50;
  public pageSizeOptions: number[] = [5, 10, 20, 50, 100, 200];
  public showFirstLastButtons: boolean = true;
  private count$$: Subscription;
  private entitySortChange$$: Subscription;
  private paginationLabelTranslation$$: Subscription[] = [];

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

  constructor(private languageService: LanguageService, private mediaService: MediaService) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnChanges() {
    this.unsubscribeAll();
    this.count$$ = this.store.stateView.count$.subscribe((count) => {
      this.length = count;
      this.emitPaginator();
    });
    this.entitySortChange$$ = this.entitySortChange$.subscribe(() => {
      if (this.paginator) {
        this.paginator.firstPage();
      }
    });
    this.initPaginatorOptions();
    this.translateLabels();
  }

  initPaginatorOptions() {
    this.disabled = this.paginatorOptions?.disabled || this.disabled;
    this.pageIndex = this.paginatorOptions?.pageIndex || this.pageIndex;
    this.pageSize = this.paginatorOptions?.pageSize || this.pageSize;
    this.pageSizeOptions = this.paginatorOptions?.pageSizeOptions || this.pageSizeOptions;
    if (this.mediaService.isMobile()) {
      this.showFirstLastButtons = false;
      this.hidePageSize = true;
    } else {
      this.showFirstLastButtons = this.paginatorOptions?.showFirstLastButtons || this.showFirstLastButtons;
      this.hidePageSize = this.paginatorOptions?.hidePageSize || this.hidePageSize;
    }
  }

  translateLabels() {

    this.paginationLabelTranslation$$.push(
      this.languageService.translate.get('igo.common.paginator.firstPageLabel').subscribe((label: string) => {
        this.paginator._intl.firstPageLabel = label;
      }));

    this.paginator._intl.getRangeLabel = this.rangeLabel;

    this.paginationLabelTranslation$$.push(
      this.languageService.translate.get('igo.common.paginator.itemsPerPageLabel').subscribe((label: string) => {
        this.paginator._intl.itemsPerPageLabel = label;
      }));
    this.paginationLabelTranslation$$.push(
      this.languageService.translate.get('igo.common.paginator.lastPageLabel').subscribe((label: string) => {
        this.paginator._intl.lastPageLabel = label;
      }));
    this.paginationLabelTranslation$$.push(
      this.languageService.translate.get('igo.common.paginator.nextPageLabel').subscribe((label: string) => {
        this.paginator._intl.nextPageLabel = label;
      }));
    this.paginationLabelTranslation$$.push(
      this.languageService.translate.get('igo.common.paginator.previousPageLabel').subscribe((label: string) => {
        this.paginator._intl.previousPageLabel = label;
      }));
  }

  rangeLabel = (page: number, pageSize: number, length: number) => {
    const of: BehaviorSubject<string> = new BehaviorSubject('');

    this.paginationLabelTranslation$$.push(
      this.languageService.translate.get('igo.common.paginator.of').subscribe((label: string) => {
        of.next(label);
      }));
    if (length === 0 || pageSize === 0) { return `0 ${of.value} ${length}`; }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${of.value} ${length}`;
  };

  private unsubscribeAll() {
    this.paginationLabelTranslation$$.map(sub => sub.unsubscribe());
    if (this.count$$) { this.count$$.unsubscribe(); }
    if (this.entitySortChange$$) { this.entitySortChange$$.unsubscribe(); }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  emitPaginator() {
    this.paginatorChange.emit(this.paginator);
  }
}
