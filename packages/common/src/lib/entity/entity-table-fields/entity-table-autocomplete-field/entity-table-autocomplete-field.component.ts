import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  EntityRecord,
  EntityTableColumn,
  SelectOption,
  getColumnKeyWithoutPropertiesTag
} from '../../shared';
import { Observable, map, startWith } from 'rxjs';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'igo-entity-table-autocomplete-field',
  templateUrl: './entity-table-autocomplete-field.component.html',
  styleUrls: ['./entity-table-autocomplete-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTableAutocompleteFieldComponent implements OnInit {
  filteredOptions$: Observable<SelectOption[]>;
  key: string;

  @Input({ required: true }) control: FormControl;
  @Input({ required: true }) column: EntityTableColumn;
  @Input({ required: true }) record: EntityRecord<any>;

  @Output() selected = new EventEmitter<string | number>();

  get entity() {
    return this.record.entity;
  }

  constructor() {}

  ngOnInit(): void {
    this.key = getColumnKeyWithoutPropertiesTag(this.column.name);

    this.filteredOptions$ = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value))
    );
  }

  private filter(value: string): SelectOption[] {
    return this.column.domainValues?.filter((option) => {
      const filterNormalized = value
        ? String(value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        : '';
      const featureNameNormalized = String(option.value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return featureNameNormalized.includes(filterNormalized);
    });
  }

  /**
   * Process autocomplete value change (edition)
   */
  onSelected(event: MatAutocompleteSelectedEvent) {
    this.control.setValue(event.option.viewValue);
    this.selected.emit(event.option.value);
  }
}
