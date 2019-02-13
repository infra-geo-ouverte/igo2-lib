import { Component, OnInit, OnDestroy } from '@angular/core';

import { EntityStore, getEntityProperty } from '@igo2/common';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss']
})
export class AppEntityTableComponent implements OnInit, OnDestroy {

  public store = new EntityStore([]);

  public template = {
    selection: true,
    sort: true,
    valueAccessor: (entity: object, name: string) => {
      return getEntityProperty(entity, name);
    },
    columns: [
      {
        name: 'selected',
        title: 'Selected',
        valueAccessor: (entity: object) => {
          return this.store.state.get(entity).selected ? 'Yes' : 'No';
        }
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
        renderer: 'HTML'
      }
    ]
  };

  constructor() {}

  ngOnInit() {
    this.store.load([
      {id: '2', name: 'Name 2', description: 'Description 2'},
      {id: '1', name: 'Name 1', description: 'Description 1'},
      {id: '3', name: 'Name 3', description: 'Description 3'}
    ]);
  }

  ngOnDestroy() {
    this.store.destroy();
  }
}
