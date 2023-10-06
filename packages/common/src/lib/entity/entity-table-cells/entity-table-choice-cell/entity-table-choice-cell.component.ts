import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  EntityRecord,
  SelectEntityTableColumn,
  SelectOption,
  isChoiceFieldWithLabelField
} from '../../shared';
import { ObjectUtils } from '@igo2/utils';

@Component({
  selector: 'igo-entity-table-choice-cell',
  templateUrl: './entity-table-choice-cell.component.html',
  styleUrls: ['./entity-table-choice-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTableChoiceCellComponent implements OnInit {
  label: string | number | boolean;

  @Input({ required: true }) column: SelectEntityTableColumn;
  @Input({ required: true }) record: EntityRecord<any>;

  ngOnInit(): void {
    if (isChoiceFieldWithLabelField(this.column)) {
      this.label = this.getEntityValue(this.alterPath(this.column.labelField));
    } else {
      this.label = this.formatSelection();
    }
  }

  private alterPath(key: string): string {
    const path = structuredClone(this.column.name).split('.');
    path.splice(-1, 1, key);
    return path.join('.');
  }

  private getEntityValue(path: string): string | number | boolean {
    return ObjectUtils.resolve(this.record.entity, path);
  }

  private formatSelection(): string {
    const selection = this.getEntityValue(this.column.name);
    if (selection == null) {
      return '';
    }

    return this.column.multiple
      ? String(selection)
          .split(',')
          .map((id) => this.findDomainValue(id)?.value)
          .join(', ')
      : String(this.findDomainValue(selection)?.value);
  }

  private findDomainValue(id): SelectOption {
    return this.column.domainValues.find(
      (option) => String(option.id) === String(id)
    );
  }
}
