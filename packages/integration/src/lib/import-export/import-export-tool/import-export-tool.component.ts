import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  model
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ToolComponent } from '@igo2/common/tool';
import type { WorkspaceStore } from '@igo2/common/workspace';
import { ContextImportExportComponent } from '@igo2/context';
import { IgoLanguageModule } from '@igo2/core/language';
import {
  ExportOptions,
  IgoMap,
  ImportExportComponent,
  ProjectionsLimitationsOptions
} from '@igo2/geo';

import { ContextState } from '../../context/context.state';
import { MapState } from '../../map/map.state';
import { WorkspaceState } from '../../workspace/workspace.state';
import {
  ImportExportMode,
  ImportExportState,
  ImportExportType
} from '../import-export.state';

@ToolComponent({
  name: 'importExport',
  title: 'igo.integration.tools.importExport',
  icon: 'file_save'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html',
  styleUrls: ['./import-export-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    ImportExportComponent,
    ContextImportExportComponent,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class ImportExportToolComponent implements OnInit {
  private mapState = inject(MapState);
  importExportState = inject(ImportExportState);
  private workspaceState = inject(WorkspaceState);
  contextState = inject(ContextState);

  readonly projectionsLimitations =
    input<ProjectionsLimitationsOptions>(undefined);

  readonly selectFirstProj = input(false);

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  get workspaceStore(): WorkspaceStore {
    return this.workspaceState.store;
  }

  readonly importExportType = model<ImportExportType>(ImportExportType.layer);
  readonly importExportShowBothType = input(true);

  ngOnInit(): void {
    this.selectType();
    this.selectMode();
  }

  private selectType() {
    const importExportType = this.importExportType();
    if (importExportType) {
      this.importExportState.importExportType$.next(importExportType);
    }
    const userSelectedType = this.importExportState.importExportType$.value;
    if (userSelectedType !== undefined) {
      this.importExportState.setImportExportType(userSelectedType);
    } else {
      this.importExportState.setImportExportType(ImportExportType.layer);
    }
  }

  private selectMode() {
    const userSelectedMode = this.importExportState.selectedMode$.value;
    if (userSelectedMode !== undefined) {
      this.importExportState.setMode(userSelectedMode);
    } else {
      this.importExportState.setMode(ImportExportMode.import);
    }
  }

  public modeChanged(mode: ImportExportMode) {
    this.importExportState.setMode(mode);
  }

  public exportOptionsChange(exportOptions: ExportOptions) {
    this.importExportState.setsExportOptions(exportOptions);
  }

  importExportTypeChange(event) {
    this.importExportType.set(event.value);
  }
}
