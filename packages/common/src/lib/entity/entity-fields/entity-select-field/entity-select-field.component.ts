import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, first, tap } from 'rxjs';
import {
  EntityRecord,
  EntityRelation,
  EntityService,
  SelectOption
} from '../../shared';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'igo-entity-select-field',
  templateUrl: './entity-select-field.component.html',
  styleUrls: ['./entity-select-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgoEntitySelectFieldComponent implements OnInit {
  isLoading: boolean;
  options$: BehaviorSubject<SelectOption[]>;
  selectionControl: FormControl<SelectOption | SelectOption[]>;

  @Input({ required: true }) record: EntityRecord<any>;
  @Input({ required: true }) relation: EntityRelation;
  @Input({ required: true }) domainValues: SelectOption[];
  @Input({ required: true }) control: FormControl;
  @Input() multiple: boolean;

  @Output() selected = new EventEmitter<string | string[]>();

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
      this.setParamsRelationship();
    } else if (!this.domainValues) {
      this.getDomainValues().subscribe((options) => {
        this.domainValues = options;
        this.setOptions(options);
      });
    }
  }

  displayFn(): string {
    const selection = this.selectionControl.value;
    if (!selection) {
      return '';
    }

    return Array.isArray(selection)
      ? selection.map((item) => item.value).join(', ')
      : (selection.value as string);
  }

  private setParamsRelationship(): void {
    const filterControl = this.control.parent.get([
      `properties.${this.relation?.params.field}`
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

  private findFormOption(): SelectOption | SelectOption[] {
    const selection = this.control?.value;
    return Array.isArray(selection)
      ? selection.map((id) =>
          this.options.find((option) => String(option.id) === String(id))
        )
      : this.options.find((option) => String(option.id) === String(selection));
  }

  onSelected(event: MatSelectChange) {
    const selection = event.value;
    const value = this.multiple
      ? selection.map((item) => item.id)
      : selection.id;
    this.control.setValue(value);
    this.selected.emit(value);
  }
}
