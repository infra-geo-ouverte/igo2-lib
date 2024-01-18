import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import {
  EntityStore,
  EntityTableButton,
  EntityTableColumnRenderer,
  EntityTablePaginatorOptions,
  EntityTableTemplate,
  IgoEntityTableModule,
  getEntityProperty
} from '@igo2/common';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoEntityTableModule]
})
export class AppEntityTableComponent implements OnInit, OnDestroy {
  public store: EntityStore = new EntityStore([]);
  public paginator: MatPaginator;
  entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public paginatorOptions: EntityTablePaginatorOptions = { pageSize: 10 };

  public template: EntityTableTemplate = {
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
        valueAccessor: () => {
          return [
            {
              icon: 'home',
              color: 'warn',
              click: (row) => {
                console.log(row);
              }
            }
          ] as EntityTableButton[];
        },
        renderer: EntityTableColumnRenderer.ButtonGroup
      }
    ]
  };

  constructor() {}

  ngOnInit(): void {
    const ids: number[] = [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    const entities: object[] = ids.map((id: number) => {
      if (id === 3) {
        return {
          id,
          name: `Name ${id}`,
          description: `<b>Description ${id}</b>`,
          url: 'https://igouverte.org',
          image: 'https://www.igouverte.org/assets/img/NONEXISTINGIMAGE.png'
        };
      }
      return {
        id,
        name: `Name ${id}`,
        description: `<b>Description ${id}</b>`,
        url: 'https://igouverte.org',
        image: 'https://www.igouverte.org/assets/img/Igo_logoavec.png'
      };
    });
    this.store.load(entities);
  }

  entitySortChange(): void {
    this.entitySortChange$.next(true);
  }

  paginatorChange(event: MatPaginator): void {
    this.paginator = event;
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }
}
