import { Component, OnInit } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { TableDatabase, TableActionColor } from '@igo2/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class AppTableComponent implements OnInit {

  public database: TableDatabase;

  public model = {
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
        icon: 'description',
        color: TableActionColor.primary,
        click: row => this.showName(row.name)
      }
    ],
    selectionCheckbox: true
  };

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.database = new TableDatabase([
      {id: '2', name: 'Name 2', description: '­Description 2'},
      {id: '1', name: 'Name 1', description: 'Description 1'},
      {id: '3', name: 'Name 3', description: 'Description 3'}
    ]);
  }

  showName(name) {
    alert(name);
  }

  handleSelect(rows) {
    console.log(rows);
  }
}
