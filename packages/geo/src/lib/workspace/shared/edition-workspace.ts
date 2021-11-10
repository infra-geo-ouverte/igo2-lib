import { MatDialog } from '@angular/material/dialog';
import {
  Workspace,
  WorkspaceOptions
} from '@igo2/common';
import { ConfigService } from '@igo2/core';
import { BehaviorSubject } from 'rxjs';

import { ImageLayer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { EditionWorkspaceService } from './edition-workspace.service';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export class EditionWorkspace extends Workspace {

  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  get layer(): ImageLayer | VectorLayer { return this.options.layer; }

  get map(): IgoMap { return this.options.map; }

  constructor(
    protected options: EditionWorkspaceOptions,
    private editionWorkspaceService: EditionWorkspaceService,
    private dialog: MatDialog,
    private configService: ConfigService) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (mapResolution > this.layer.minResolution && mapResolution < this.layer.maxResolution) {
        this.inResolutionRange$.next(true);
      } else {
        this.inResolutionRange$.next(false);
      }
    });
  }

  deleteFeature(feature, workspace) {
    setTimeout(() => {
      const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
        disableClose: false,
        data: {type: 'delete'}
    });

      dialogRef.afterClosed().subscribe(result => {
        if (result === false) {
          let id;
          let url =
            this.configService.getConfig('edition.url') +
            workspace.layer.dataSource.options.edition.baseUrl + '?' +
            workspace.layer.dataSource.options.edition.deleteUrl;
          for (const column of workspace.meta.tableTemplate.columns) {
            for (const property in feature.properties) {
              const columnName = column.name.slice(11);
              if (columnName === property && column.primary === true) {
                id = feature.properties[property];
              }
            }
          }
          if (url) {
            url += id;
            this.editionWorkspaceService.deleteFeature(feature, workspace, url);
          }
        }
      })
    }, 250)
  }

  editFeature(feature, workspace) {
    feature.edition = true;
    console.log('edition', feature);
    let id;
    outerloop: for (const column of workspace.meta.tableTemplate.columns ) {
      for (const property in feature.properties) {
        const columnName = column.name.slice(11);
        if (columnName === property && column.primary === true) {
          id = feature.properties[property];
          break outerloop;
        }
      }
    }
    if (id) {
      console.log('edit');
      feature.idkey = id;
      workspace.entityStore.state.update(feature, { selected: true });

    } else {
      console.log('add');
      feature.new = true;
      workspace.entityStore.insert(feature);
      workspace.entityStore.state.update(feature, { selected: true });
      setTimeout(() => {
        let element = document.getElementsByClassName('edition-table')[0].getElementsByTagName('tbody')[0]
          .lastElementChild.lastElementChild.firstElementChild.firstElementChild as HTMLElement;
        console.log(element);
        element.click();
      }, 500);
    }
  }
}
