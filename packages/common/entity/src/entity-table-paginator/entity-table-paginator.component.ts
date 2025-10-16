import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { LanguageService } from '@igo2/core/language';
import { MediaService } from '@igo2/core/media';

import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityStore } from '../shared';
import { EntityTablePaginatorOptions } from './entity-table-paginator.interface';

@Component({
  selector: 'igo-entity-table-paginator',
  templateUrl: './entity-table-paginator.component.html',
  styleUrls: ['./entity-table-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatPaginatorModule]
})
export class EntityTablePaginatorComponent implements OnChanges, OnDestroy {
  private languageService = inject(LanguageService);
  private mediaService = inject(MediaService);

  public disabled = false;
  public hidePageSize = false;
  public pageIndex = 0;
  public pageSize = 50;
  public pageSizeOptions: number[] = [5, 10, 20, 50, 100, 200];
  public showFirstLastButtons = true;
  private count$$: Subscription;
  private entitySortChange$$: Subscription;
  private paginationLabelTranslation$$: Subscription[] = [];

  readonly entitySortChange$ = input(new BehaviorSubject<boolean>(false));
  /**
   * Entity store
   */
  readonly store = input<EntityStore<object>>(undefined);

  /**
   * Paginator options
   */
  readonly paginatorOptions = input<EntityTablePaginatorOptions>(undefined);

  public length = 0;

  /**
   * Paginator emitted.
   */
  readonly paginatorChange = output<MatPaginator>();

  readonly paginator = viewChild(MatPaginator);

  ngOnChanges() {
    this.unsubscribeAll();
    this.count$$ = this.store().stateView.count$.subscribe((count) => {
      this.length = count;
      this.emitPaginator();
    });
    this.entitySortChange$$ = this.entitySortChange$().subscribe(() => {
      const paginator = this.paginator();
      if (paginator) {
        paginator.firstPage();
      }
    });
    this.initPaginatorOptions();
    this.translateLabels();
  }

  initPaginatorOptions() {
    this.disabled = this.paginatorOptions()?.disabled || this.disabled;
    this.pageIndex = this.paginatorOptions()?.pageIndex || this.pageIndex;
    this.pageSize = this.paginatorOptions()?.pageSize || this.pageSize;
    this.pageSizeOptions =
      this.paginatorOptions()?.pageSizeOptions || this.pageSizeOptions;
    if (this.mediaService.isMobile()) {
      this.showFirstLastButtons = false;
      this.hidePageSize = true;
    } else {
      this.showFirstLastButtons =
        this.paginatorOptions()?.showFirstLastButtons ||
        this.showFirstLastButtons;
      this.hidePageSize =
        this.paginatorOptions()?.hidePageSize || this.hidePageSize;
    }
  }

  translateLabels() {
    this.paginationLabelTranslation$$.push(
      this.languageService.translate
        .get('igo.common.paginator.firstPageLabel')
        .subscribe((label: string) => {
          this.paginator()._intl.firstPageLabel = label;
        })
    );

    this.paginator()._intl.getRangeLabel = this.rangeLabel;

    this.paginationLabelTranslation$$.push(
      this.languageService.translate
        .get('igo.common.paginator.itemsPerPageLabel')
        .subscribe((label: string) => {
          this.paginator()._intl.itemsPerPageLabel = label;
        })
    );
    this.paginationLabelTranslation$$.push(
      this.languageService.translate
        .get('igo.common.paginator.lastPageLabel')
        .subscribe((label: string) => {
          this.paginator()._intl.lastPageLabel = label;
        })
    );
    this.paginationLabelTranslation$$.push(
      this.languageService.translate
        .get('igo.common.paginator.nextPageLabel')
        .subscribe((label: string) => {
          this.paginator()._intl.nextPageLabel = label;
        })
    );
    this.paginationLabelTranslation$$.push(
      this.languageService.translate
        .get('igo.common.paginator.previousPageLabel')
        .subscribe((label: string) => {
          this.paginator()._intl.previousPageLabel = label;
        })
    );
  }

  rangeLabel = (page: number, pageSize: number, length: number) => {
    const of = new BehaviorSubject<string>('');

    this.paginationLabelTranslation$$.push(
      this.languageService.translate
        .get('igo.common.paginator.of')
        .subscribe((label: string) => {
          of.next(label);
        })
    );
    if (length === 0 || pageSize === 0) {
      return `0 ${of.value} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${of.value} ${length}`;
  };

  private unsubscribeAll() {
    this.paginationLabelTranslation$$.map((sub) => sub.unsubscribe());
    if (this.count$$) {
      this.count$$.unsubscribe();
    }
    if (this.entitySortChange$$) {
      this.entitySortChange$$.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  emitPaginator() {
    this.paginatorChange.emit(this.paginator());
  }
}
