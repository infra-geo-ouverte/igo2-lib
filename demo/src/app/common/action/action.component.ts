import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { Media, MediaOrientation, MediaService } from '@igo2/core';
import { ActionStore, ActionbarMode } from '@igo2/common';
import {Overlay} from '@angular/cdk/overlay';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class AppActionComponent implements OnInit, OnDestroy {

  public store = new ActionStore([]);

  private added = false;

  get actionbarMode(): ActionbarMode {
    const media = this.mediaService.media$.value;
    const orientation = this.mediaService.orientation$.value;
    if (media === Media.Desktop && orientation === MediaOrientation.Landscape) {
      return ActionbarMode.Dock;
    }
    return ActionbarMode.Overlay;
  }

  constructor(private mediaService: MediaService, public overlay: Overlay) {}

  ngOnInit() {
    const added = () => this.added === true;

    this.store.load([
      {
        id: 'add',
        title: 'Add',
        icon: 'add',
        tooltip: 'Add Tooltip',
        handler: () => {
          alert('Add!');
          this.added = true;
          this.store.updateActionsAvailability();
        },
      },
      {
        id: 'edit',
        title: 'Edit',
        icon: 'edit',
        tooltip: 'Edit Tooltip',
        handler: (item: string) => {
          alert(`Edit item ${item}!`);
        },
        conditions: [added],
        args: ['1']
      },
      {
        id: 'delete',
        title: 'Delete',
        tooltip: 'Delete Tooltip',
        icon: 'delete',
        handler: () => {
          alert('Delete!');
          this.added = false;
          this.store.updateActionsAvailability();
        },
        conditions: [added]
      }
    ]);
    this.store.updateActionsAvailability();
  }

  ngOnDestroy() {
    this.store.destroy();
  }
}
