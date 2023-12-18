import { Component, OnInit } from '@angular/core';

import { TableActionColor, TableDatabase } from '@igo2/common';
import { LanguageService } from '@igo2/core';

import { IgoTableModule } from '../../../../../../packages/common/src/lib/table/table.module';
import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoTableModule]
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
        icon: 'file-document',
        color: TableActionColor.primary,
        click: (row) => this.showName(row.name)
      }
    ],
    selectionCheckbox: true
  };

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.database = new TableDatabase([
      { id: '2', name: 'Name 2', description: 'Hello 2' },
      { id: '1', name: 'Name 1', description: 'Bonjour 1' },
      { id: '3', name: 'Name 3', description: 'Hola 3' }
    ]);
  }

  showName(name) {
    alert(name);
  }

  handleSelect(rows) {
    console.log(rows);
  }
}
