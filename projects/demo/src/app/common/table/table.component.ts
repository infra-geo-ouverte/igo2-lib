import { Component, OnInit } from '@angular/core';

import { TableActionColor, TableDatabase, TableModel } from '@igo2/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class AppTableComponent implements OnInit {
  public database: TableDatabase;

  public model: TableModel = {
    columns: [
      {
        name: 'id',
        title: 'ID',
        sortable: false,
        filterable: true
      },
      {
        name: 'name',
        title: 'Name',
        sortable: true,
        filterable: true
      },
      {
        name: 'description',
        title: 'Description',
        sortable: true,
        filterable: true
      }
    ],
    actions: [
      {
        icon: 'file-document',
        color: TableActionColor.primary,
        click: (row) => this.showName(row.name)
      }
    ],
    selectionCheckbox: true
  };

  constructor() {}

  ngOnInit() {
    this.database = new TableDatabase([
      { id: '2', name: 'Name 2', description: 'Hello 2' },
      { id: '1', name: 'Name 1', description: 'Bonjour 1' },
      { id: '3', name: 'Name 3', description: 'Hola 3' }
    ]);
  }

  showName(name: string): void {
    alert(name);
  }

  handleSelect(rows: any): void {
    console.log(rows);
  }
}
