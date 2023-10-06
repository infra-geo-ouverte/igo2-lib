import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { EntityRecord, SelectEntityTableColumn } from '../../shared';

@Component({
  selector: 'igo-entity-table-choice-cell',
  templateUrl: './entity-table-choice-cell.component.html',
  styleUrls: ['./entity-table-choice-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTableChoiceCellComponent implements OnInit {
  label: string | number;

  @Input({ required: true }) column: SelectEntityTableColumn;
  @Input({ required: true }) record: EntityRecord<any>;

  ngOnInit(): void {
    this.label = this.getEntityValue(this.column.labelField);
  }

  private getEntityValue(key: string) {
    return this.record.entity.properties[key];
  }
}
