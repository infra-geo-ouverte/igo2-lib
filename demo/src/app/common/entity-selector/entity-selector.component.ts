import { Component, OnInit, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { LanguageService } from '@igo2/core';
import { EntityStore } from '@igo2/common';

interface DemoEntity {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-entity-selector',
  templateUrl: './entity-selector.component.html',
  styleUrls: ['./entity-selector.component.scss']
})
export class AppEntitySelectorComponent implements OnInit, OnDestroy {
  public store = new EntityStore([]);

  public selected$ = new BehaviorSubject<DemoEntity>(undefined);

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.store.load([
      { id: '2', name: 'Name 2', description: '<b>Description 2</b>' },
      { id: '1', name: 'Name 1', description: '<b>Description 1</b>' },
      { id: '3', name: 'Name 3', description: '<b>Description 3</b>' }
    ]);
  }

  ngOnDestroy() {
    this.store.destroy();
  }

  getTitle(entity: DemoEntity): string {
    return entity.name;
  }

  onSelectedChange(event: { selected: boolean; entity: DemoEntity }) {
    this.selected$.next(event.entity);
  }
}
