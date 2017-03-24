import { Component, OnInit, Input, Output, EventEmitter,
         ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'igo-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.styl']
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
  get disabled() { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean = false;

  @Input()
  get buttonColor() { return this._buttonColor; }
  set buttonColor(value: string) {
    this._buttonColor = value;
  }
  private _buttonColor: string = 'primary';

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

  private readonly _invalidKeys = ['Control', 'Shift', 'Alt'];
  private _stream$ = new Subject<string>();
  private _streamS: Subscription;

  @Output() key = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  @ViewChild('input') input: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this._streamS = this._stream$
      .debounceTime(this._debounce)
      .distinctUntilChanged()
      .subscribe((term: string) => this.handleTermChanged(term));
  }

  ngOnDestroy() {
    this._streamS.unsubscribe();
  }

  keyup(event: KeyboardEvent) {
    if (this.disabled) { return; }

    const term = (event.target as HTMLInputElement).value;
    this.term = term;

    if (this.keyIsValid(term) &&
        (term.length >= this.length || term.length === 0)) {
      this._stream$.next(term);
    }
  }

  clear() {
    this.term = '';
    this._stream$.next(this.term);
  }

  private keyIsValid(key: string) {
    return this._invalidKeys.find(value => value === key) === undefined;
  }

  private handleTermChanged(term: string | undefined) {
    this.search.emit(term);
  }
}
