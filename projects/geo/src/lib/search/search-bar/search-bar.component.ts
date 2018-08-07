import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';

import { FloatLabelType } from '@angular/material';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FeatureService } from '../../feature/shared/feature.service';
import {
  SourceFeatureType,
  FeatureType
} from '../../feature/shared/feature.enum';
import { Feature } from '../../feature/shared/feature.interface';

import { SearchService } from '../shared/search.service';

@Component({
  selector: 'igo-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input()
  get term() {
    return this._term;
  }
  set term(value: string) {
    this._term = value;
  }
  private _term = '';

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
  }
  private _placeholder = '';

  @Input()
  get floatLabel() {
    return this._floatLabel;
  }
  set floatLabel(value: FloatLabelType) {
    this._floatLabel = value;
  }
  private _floatLabel: FloatLabelType = 'auto';

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled = false;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  @Input()
  get debounce() {
    return this._debounce;
  }
  set debounce(value: number) {
    this._debounce = value;
  }
  private _debounce = 300;

  @Input()
  get length() {
    return this._length;
  }
  set length(value: number) {
    this._length = value;
  }
  private _length = 3;

  @Input()
  get searchIcon() {
    return this._searchIcon;
  }
  set searchIcon(value: boolean) {
    this._searchIcon = value;
  }
  private _searchIcon = false;

  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];
  private stream$ = new Subject<string>();
  private stream$$: Subscription;
  private selectedFeature$$: Subscription;

  @Output() search = new EventEmitter<string>();

  @ViewChild('input') input: ElementRef;

  constructor(
    private searchService: SearchService,
    private featureService: FeatureService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stream$$ = this.stream$
      .pipe(
        debounceTime(this._debounce),
        distinctUntilChanged()
      )
      .subscribe((term: string) => this.handleTermChanged(term));

    this.selectedFeature$$ = this.featureService.selectedFeature$.subscribe(
      feature => {
        if (
          feature &&
          feature.type === FeatureType.Feature &&
          feature.sourceType === SourceFeatureType.Search
        ) {
          this.term = feature.title;
          this.changeDetectorRef.markForCheck();
        }
      }
    );
  }

  ngOnDestroy() {
    this.stream$$.unsubscribe();
    this.selectedFeature$$.unsubscribe();
  }

  keyup(event: KeyboardEvent) {
    const term = (event.target as HTMLInputElement).value;
    this.setTerm(term);
  }

  setTerm(term: string) {
    if (this.disabled) {
      return;
    }

    this.term = term;

    if (
      this.keyIsValid(term) &&
      (term.length >= this.length || term.length === 0)
    ) {
      this.stream$.next(term);
    }
  }

  clear() {
    this.term = '';
    this.stream$.next(this.term);
    this.input.nativeElement.focus();
  }

  private keyIsValid(key: string) {
    return this.invalidKeys.indexOf(key) === -1;
  }

  private handleTermChanged(term: string) {
    if (term !== undefined || term !== '') {
      this.featureService.clear();
      this.search.emit(term);
      // tslint:disable-next-line:max-line-length
      if (
        /^([-+]?)([\d]{1,15})(((\.)?(\d+)?(,)))(\s*)(([-+]?)([\d]{1,15})((\.)?(\d+)?(;[\d]{4,5})?))$/g.test(
          term
        )
      ) {
        let xy;
        if (/(;[\d]{4,5})$/g.test(term)) {
          const xyTerm = term.split(';');
          // TODO Reproject coordinates
          xy = JSON.parse('[' + xyTerm[0] + ']');
        } else {
          if (term.lastIndexOf('.') === term.length - 1) {
            term += '0';
          }
          xy = JSON.parse('[' + term + ']');
        }
        const r = this.searchService.locate(xy);
        if (r) {
          r.filter(res => res !== undefined).map(res =>
            res.subscribe(features =>
              this.featureService.updateFeatures(
                features as Feature[],
                undefined
              )
            )
          );
        }
      } else {
        const r = this.searchService.search(term);
        if (r) {
          r.map(res =>
            res.subscribe(features =>
              this.featureService.updateFeatures(
                features as Feature[],
                undefined
              )
            )
          );
        }
      }
    }
  }
}
