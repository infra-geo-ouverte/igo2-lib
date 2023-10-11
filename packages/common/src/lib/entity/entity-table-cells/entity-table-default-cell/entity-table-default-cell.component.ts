import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

import { ObjectUtils } from '@igo2/utils';

import moment from 'moment';

import { EntityRecord, EntityTableColumn } from '../../shared';

type EntityDefaultCellType = 'default' | 'img' | 'url';

@Component({
  selector: 'igo-entity-table-default-cell',
  templateUrl: './entity-table-default-cell.component.html',
  styleUrls: ['./entity-table-default-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTableDefaultCellComponent implements OnInit {
  value: object;
  type: EntityDefaultCellType;

  @Input({ required: true }) column: EntityTableColumn;
  @Input({ required: true }) record: EntityRecord<any>;

  ngOnInit(): void {
    this.value = this.getValue();
    this.type = this.getType();
  }

  private getValue(): any {
    const entity = this.record.entity;
    if (this.column.valueAccessor !== undefined) {
      return this.column.valueAccessor(entity, this.record);
    }

    let value = ObjectUtils.resolve(entity, this.column.name);
    if (this.column.type === 'boolean') {
      value = this.getBooleanValue(value, this.record);
    } else if (this.column.type === 'date') {
      value = this.getDateValue(value, this.record);
    }

    if (value === undefined) {
      value = '';
    }

    return value;
  }

  private getDateValue(
    value: string | number,
    record: EntityRecord<object>
  ): string | number {
    if (value && this.isEdition) {
      let date = moment(value);
      value = date.format();
    } else if (!this.isEdition && value === null) {
      value = '';
    }
    return value;
  }

  private getBooleanValue(
    value: string | number | boolean,
    record: EntityRecord<object>
  ): string | number | boolean {
    if (value === undefined || value === null || value === '') {
      value = false;
    } else if (typeof value !== 'boolean' && value !== undefined) {
      if (typeof value === 'number') {
        value = Boolean(value);
      } else {
        value = JSON.parse(value.toLowerCase());
      }
    }
    if (!this.isEdition) {
      value = value ? '&#10003;' : ''; // check mark
    }

    return value;
  }

  get isEdition(): boolean {
    return this.record.entity.edition;
  }

  private getType(): EntityDefaultCellType {
    return this.isUrl(this.value)
      ? this.isImg(this.value)
        ? 'img'
        : 'url'
      : 'default';
  }

  private isImg(value: any): boolean {
    if (this.isUrl(value)) {
      return (
        ['jpg', 'png', 'gif'].indexOf(value.split('.').pop().toLowerCase()) !==
        -1
      );
    } else {
      return false;
    }
  }

  private isUrl(value: any): boolean {
    if (typeof value === 'string') {
      return (
        value.slice(0, 8) === 'https://' || value.slice(0, 7) === 'http://'
      );
    } else {
      return false;
    }
  }
}
