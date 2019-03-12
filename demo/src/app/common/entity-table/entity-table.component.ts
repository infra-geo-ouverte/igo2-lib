import { Component, OnInit, OnDestroy } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { EntityStore, getEntityProperty, EntityTableColumnRenderer } from '@igo2/common';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss']
})
export class AppEntityTableComponent implements OnInit, OnDestroy {

  public store = new EntityStore([]);

  public template = {
    selection: true,
    selectionCheckbox: true,
    selectMany: true,
    sort: true,
    valueAccessor: (entity: object, name: string) => {
      return getEntityProperty(entity, name);
    },
    columns: [
      {
        name: 'selected',
        title: 'Selected',
        valueAccessor: (entity: object) => {
          return this.store.state.get(entity).selected ? 'radio_button_checked' : 'radio_button_unchecked';
        },
        renderer: EntityTableColumnRenderer.Icon
      },
      {
        name: 'id',
        title: 'ID'
      },
      {
        name: 'name',
        title: 'Name'
      },
      {
        name: 'description',
        title: 'Description',
        renderer: EntityTableColumnRenderer.HTML
      }
    ]
  };

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.store.load([
      {id: '2', name: 'Name 2', description: '<b>Description 2</b>'},
      {id: '1', name: 'Name 1', description: '<b>Description 1</b>'},
      {id: '3', name: 'Name 3', description: '<b>Description 3</b>'}
    ]);
  }

  ngOnDestroy() {
    this.store.destroy();
  }
}
