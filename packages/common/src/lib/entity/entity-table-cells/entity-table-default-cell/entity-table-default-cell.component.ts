import { Component, Input, OnInit } from '@angular/core';
import { CellData } from '../../shared/entity-table.interface';

type EntityDefaultCellType = 'default' | 'img' | 'url';

@Component({
  selector: 'igo-entity-table-default-cell',
  templateUrl: './entity-table-default-cell.component.html',
  styleUrls: ['./entity-table-default-cell.component.scss']
})
export class EntityTableDefaultCellComponent implements OnInit {
  type: EntityDefaultCellType;

  @Input({ required: true }) cellData: CellData;

  ngOnInit(): void {
    this.type = this.getType();
  }

  private getType(): EntityDefaultCellType {
    const value = this.cellData.value;
    return this.isUrl(value) ? (this.isImg(value) ? 'img' : 'url') : 'default';
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
