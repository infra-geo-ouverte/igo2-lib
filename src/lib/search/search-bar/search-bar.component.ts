import { Component, OnInit, Input, Output,
         EventEmitter, ViewChild, ElementRef,
         OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FloatLabelType } from '@angular/material'

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SearchService } from '../shared';

@Component({
  selector: 'igo-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnInit, OnDestroy {

  @Input()
  get term() { return this._term; }
  set term(value: string) {
    this._term = value;
  }
  private _term: string = '';

  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
  }
  private _placeholder: string = '';

  @Input()
  get floatLabel() { return this._floatLabel; }
  set floatLabel(value: FloatLabelType) {
    this._floatLabel = value;
  }
  private _floatLabel: FloatLabelType = 'auto';

  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean = false;

  @Input()
  get color() { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  @Input()
  get debounce() { return this._debounce; }
  set debounce(value: number) {
    this._debounce = value;
  }
  private _debounce: number = 300;

  @Input()
  get length() { return this._length; }
  set length(value: number) {
    this._length = value;
  }
  private _length: number = 3;

  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];
  private stream$ = new Subject<string>();
  private stream$$: Subscription;

  @Output() search = new EventEmitter<string>();

  @ViewChild('input') input: ElementRef;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.stream$$ = this.stream$.pipe(
      debounceTime(this._debounce),
      distinctUntilChanged()
    ).subscribe((term: string) => this.handleTermChanged(term));
  }

  ngOnDestroy() {
    this.stream$$.unsubscribe();
  }

  keyup(event: KeyboardEvent) {
    const term = (event.target as HTMLInputElement).value;
    this.setTerm(term);
  }

  setTerm(term: string) {
    if (this.disabled) { return; }

    this.term = term;

    if (this.keyIsValid(term) &&
        (term.length >= this.length || term.length === 0)) {
      this.stream$.next(term);
    }
  }

  clear() {
    this.term = '';
    this.stream$.next(this.term);
    this.input.nativeElement.focus();
  }

  private keyIsValid(key: string) {
    return this.invalidKeys.find(value => value === key) === undefined;
  }

  private handleTermChanged(term: string) {
    if (term !== undefined) {
      this.search.emit(term);
      this.searchService.search(term);
    }
  }
}
