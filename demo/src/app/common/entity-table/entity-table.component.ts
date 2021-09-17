import { Component, OnInit, OnDestroy } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  EntityStore,
  EntityTableButton,
  getEntityProperty,
  EntityTableColumnRenderer,
  EntityTablePaginatorOptions
} from '@igo2/common';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss']
})
export class AppEntityTableComponent implements OnInit, OnDestroy {
  public store = new EntityStore([]);
  public paginator: MatPaginator;
  entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public paginatorOptions: EntityTablePaginatorOptions = {pageSize: 10};

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
          return this.store.state.get(entity).selected
            ? 'radiobox-marked'
            : 'radiobox-blank';
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
      },
      {
        name: 'url',
        title: 'Hyperlink'
      },
      {
        name: 'image',
        title: 'Image'
      },
      {
        name: 'action',
        title: '',
        valueAccessor: (entity: object) => {
          return [{
            icon: 'home',
            color: 'warn',
            click: (row) => { console.log(row); }
          }] as EntityTableButton[];
        },
        renderer: EntityTableColumnRenderer.ButtonGroup
      }
    ]
  };

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    const ids = [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    const entities = ids.map(id => {
      return { id , name: `Name ${id}`, description: `<b>Description ${id}</b>`, url: 'https://igouverte.org', image: 'https://www.igouverte.org/assets/img/Igo_logoavec.png'};
    });
    this.store.load(entities);
  }

  entitySortChange() {
    this.entitySortChange$.next(true);
  }

  paginatorChange(event: MatPaginator) {
    this.paginator = event;
  }

  ngOnDestroy() {
    this.store.destroy();
  }
}
