import { Overlay } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActionStore, ActionbarComponent, ActionbarMode } from '@igo2/common';
import { Media, MediaOrientation, MediaService } from '@igo2/core';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, ActionbarComponent]
})
export class AppActionComponent implements OnInit, OnDestroy {
  public store: ActionStore = new ActionStore([]);

  private added$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get actionbarMode(): ActionbarMode {
    const media: Media = this.mediaService.media$.value;
    const orientation: MediaOrientation = this.mediaService.orientation$.value;
    if (media === Media.Desktop && orientation === MediaOrientation.Landscape) {
      return ActionbarMode.Dock;
    }
    return ActionbarMode.Overlay;
  }

  constructor(
    public overlay: Overlay,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.store.load([
      {
        id: 'add',
        title: 'Add',
        icon: 'plus',
        tooltip: 'Add Tooltip',
        handler: () => {
          alert('Add!');
          this.added$.next(true);
        }
      },
      {
        id: 'edit',
        title: 'Edit',
        icon: 'pencil',
        tooltip: 'Edit Tooltip',
        args: ['1'],
        handler: (item: string) => {
          alert(`Edit item ${item}!`);
        },
        availability: () => this.added$
      },
      {
        id: 'delete',
        title: 'Delete',
        tooltip: 'Delete Tooltip',
        icon: 'delete',
        handler: () => {
          alert('Delete!');
          this.added$.next(false);
        },
        availability: () => this.added$
      }
    ]);
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }
}
