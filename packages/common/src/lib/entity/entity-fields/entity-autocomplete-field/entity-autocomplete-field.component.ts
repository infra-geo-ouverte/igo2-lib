import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  EntityRecord,
  EntityRelation,
  EntityRelationParam,
  EntityService,
  SelectOption
} from '../../shared';
import { BehaviorSubject, Observable, first, map, startWith, tap } from 'rxjs';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'igo-entity-autocomplete-field',
  templateUrl: './entity-autocomplete-field.component.html',
  styleUrls: ['./entity-autocomplete-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgoEntityAutocompleteFieldComponent implements OnInit {
  filteredOptions$: Observable<SelectOption[]>;
  selectionControl: FormControl<SelectOption>;
  isLoading: boolean;
  options$: BehaviorSubject<SelectOption[]>;

  @Input({ required: true }) record: EntityRecord<any>;
  @Input({ required: true }) relation: EntityRelation;
  @Input({ required: true }) domainValues: SelectOption[];
  @Input({ required: true }) control: FormControl;

  @Output() selected = new EventEmitter<SelectOption>();

  get options(): SelectOption[] {
    return this.options$.value;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private entityService: EntityService
  ) {}

  ngOnInit(): void {
    this.options$ = new BehaviorSubject(this.domainValues ?? []);

    this.selectionControl = new FormControl(this.findFormOption());

    if (this.relation?.params) {
      this.setParamsRelationship(this.relation?.params);
    } else if (!this.domainValues) {
      this.getDomainValues().subscribe((options) => {
        this.domainValues = options;
        this.setOptions(options);
      });
    }

    this.initAutocompleteFilter();
  }

  displayFn(option: SelectOption | null): string {
    return option?.value ? String(option?.value) : '';
  }

  private setParamsRelationship(param: EntityRelationParam): void {
    const filterControl = this.control.parent.get([
      `properties.${param.field}`
    ]);
    this.getDomainValues(filterControl.value).subscribe((options) =>
      this.setOptions(options)
    );

    filterControl.valueChanges.subscribe((value) =>
      this.getDomainValues(value).subscribe((options) =>
        this.setOptions(options)
      )
    );
  }

  private initAutocompleteFilter(): void {
    this.filteredOptions$ = this.selectionControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value ?? ''))
    );
  }

  private getDomainValues(value?: string): Observable<SelectOption[]> {
    this.isLoading = true;
    this.cdr.markForCheck();

    const params = this.relation.params;
    const paramsValue = params ? { [params.field]: value } : null;

    return this.entityService.getDomainValues(this.relation, paramsValue).pipe(
      first(),
      tap(() => (this.isLoading = false))
    );
  }

  private setOptions(options: SelectOption[]) {
    this.options$.next(options);

    const option = this.findFormOption();
    option
      ? this.selectionControl.setValue(option)
      : this.selectionControl.reset(undefined);
  }

  private filter(option: string | SelectOption): SelectOption[] {
    const name = typeof option === 'string' ? option : option.value;
    return name ? this.filterOptions(name) : this.options;
  }

  private findFormOption(): SelectOption {
    const id = this.control?.value;
    return this.options.find((option) => String(option.id) === String(id));
  }

  private filterOptions(name: string | number): SelectOption[] {
    return this.options?.filter((option) => {
      const filterNormalized = this.normalizeValue(name);
      const optionNoarmalized = this.normalizeValue({ ...option }.value);
      return optionNoarmalized.includes(filterNormalized);
    });
  }

  private normalizeValue(value: string | number): string {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    const option = event.option.value satisfies SelectOption;
    this.control.setValue(option.id);
    this.selected.emit(option.id);
  }
}
