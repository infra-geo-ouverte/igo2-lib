import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
import { FloatLabelType } from '@angular/material';

import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'igo-layer-list-tool',
  templateUrl: './layer-list-tool.component.html',
  styleUrls: ['./layer-list-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListToolComponent implements OnInit {

  public onlyVisible: boolean = false;
  public sortedAlpha: boolean = false;
  public term$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  term$$: Subscription;

  @Input() layersAreAllVisible: boolean = true;

  @Input() floatLabel: FloatLabelType = 'auto';

  @Input()
  set term(value: string) {
    this.term$.next(value);
  }
  get term(): string {
    return this.term$.value;
  }

  @Output() keyword: EventEmitter<string> = new EventEmitter<string>(undefined);
  @Output() sortAlpha: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output() showVisible: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  ngOnInit(): void {
    this.term$$ = this.term$.subscribe(keyword => {
      this.keyword.emit(keyword);
    }
    );
  }

  clearTerm() {
    this.term = undefined;
  }
  toggleSortAlpha() {
    this.sortedAlpha = !this.sortedAlpha;
    this.sortAlpha.emit(this.sortedAlpha);
  }

  toggleOnlyVisible() {
    this.onlyVisible = !this.onlyVisible;
    this.showVisible.emit(this.onlyVisible);
  }

}
