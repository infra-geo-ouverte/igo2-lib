import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { EntitySelectorComponent, EntityStore } from '@igo2/common/entity';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

interface DemoEntity {
  id: string;
  name: string;
  description: string;
}

@Component({
    selector: 'app-entity-selector',
    templateUrl: './entity-selector.component.html',
    styleUrls: ['./entity-selector.component.scss'],
    imports: [
        DocViewerComponent,
        ExampleViewerComponent,
        EntitySelectorComponent,
        NgIf,
        AsyncPipe
    ]
})
export class AppEntitySelectorComponent implements OnInit, OnDestroy {
  public store: EntityStore = new EntityStore([]);

  public selectedEntity$: BehaviorSubject<DemoEntity> =
    new BehaviorSubject<DemoEntity>(undefined);
  public entityIsSelected: boolean;

  ngOnInit(): void {
    this.store.load([
      { id: '2', name: 'Name 2', description: '<b>Description 2</b>' },
      { id: '1', name: 'Name 1', description: '<b>Description 1</b>' },
      { id: '3', name: 'Name 3', description: '<b>Description 3</b>' }
    ] satisfies DemoEntity[]);
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }

  getTitle(entity: DemoEntity): string {
    return entity.name;
  }

  onSelectedChange(event: { selected: boolean; value: DemoEntity }): void {
    this.entityIsSelected = event.value.id ? true : false;
    this.selectedEntity$.next(event.value);
  }
}
