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
import { ChangeDetectorRef } from '@angular/core';

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

  addFeature(feature, workspace) {
    console.log('add', feature);
    workspace.entityStore.insert(feature);
    workspace.entityStore.state.update(feature, { selected: true });
    this.activateModifyMode(feature, workspace);
    let url =
      this.configService.getConfig('edition.url') +
      workspace.layer.dataSource.options.edition.baseUrl;
    let properties;
    if (url) {
      //this.editionWorkspaceService.addFeature(url, properties);
      //console.log(url);
    }
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

  activateModifyMode(feature, workspace) {
    
  }

  modifyFeature(feature, workspace) {
    
  }

  cancelEdit(feature, workspace){
    
  }
}
