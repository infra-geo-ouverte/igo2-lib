import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';

import { BehaviorSubject, Subscription } from 'rxjs';

import { LayerListControlsOptions } from './layer-list-tool.interface';
import { TranslateModule } from '@ngx-translate/core';
import { IgoBadgeIconDirective } from '../../../../../common/src/lib/badge-icon/badge-icon.directive';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'igo-layer-list-tool',
    templateUrl: './layer-list-tool.component.html',
    styleUrls: ['./layer-list-tool.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, FormsModule, MatTooltipModule, NgIf, MatButtonModule, MatIconModule, MatBadgeModule, IgoBadgeIconDirective, TranslateModule]
})
export class LayerListToolComponent implements OnInit, OnDestroy {
  public onlyVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public sortAlpha$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public term$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  onlyVisible$$: Subscription;
  sortAlpha$$: Subscription;
  term$$: Subscription;

  @Input() layersAreAllVisible: boolean = true;

  @Input() floatLabel: FloatLabelType = 'auto';

  @Input()
  set onlyVisible(value: boolean) {
    this.onlyVisible$.next(value);
  }
  get onlyVisible(): boolean {
    return this.onlyVisible$.value;
  }

  @Input()
  set sortAlpha(value: boolean) {
    this.sortAlpha$.next(value);
  }
  get sortAlpha(): boolean {
    return this.sortAlpha$.value;
  }

  @Input()
  set term(value: string) {
    this.term$.next(value);
  }
  get term(): string {
    return this.term$.value;
  }

  public selectionMode = false;

  @Output() appliedFilterAndSort = new EventEmitter<LayerListControlsOptions>();
  @Output() selection = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.term$$ = this.term$.subscribe((keyword) => {
      this.appliedFilterAndSort.emit({
        keyword,
        onlyVisible: this.onlyVisible,
        sortAlpha: this.sortAlpha
      });
    });

    this.onlyVisible$$ = this.onlyVisible$.subscribe((onlyVisible) => {
      this.appliedFilterAndSort.emit({
        keyword: this.term,
        onlyVisible,
        sortAlpha: this.sortAlpha
      });
    });
    this.sortAlpha$$ = this.sortAlpha$.subscribe((sortAlpha) => {
      this.appliedFilterAndSort.emit({
        keyword: this.term,
        onlyVisible: this.onlyVisible,
        sortAlpha
      });
    });
  }

  ngOnDestroy(): void {
    this.onlyVisible$$.unsubscribe();
    this.sortAlpha$$.unsubscribe();
    this.term$$.unsubscribe();
  }

  clearTerm() {
    this.term = undefined;
  }
  toggleSortAlpha() {
    this.sortAlpha = !this.sortAlpha;
  }

  toggleOnlyVisible() {
    this.onlyVisible = !this.onlyVisible;
  }

  toggleSelectionMode() {
    this.selectionMode = !this.selectionMode;
    this.selection.emit(this.selectionMode);
  }
}
