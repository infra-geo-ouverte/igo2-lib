import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import type { WorkspaceStore } from '@igo2/common';
import { IgoMap, ExportOptions, ProjectionsLimitationsOptions } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { ImportExportMode, ImportExportState, ImportExportType } from '../import-export.state';
import { WorkspaceState } from '../../workspace/workspace.state';
import { ContextState } from '../../context/context.state';

@ToolComponent({
  name: 'importExport',
  title: 'igo.integration.tools.importExport',
  icon: 'file-move'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html',
  styleUrls: ['./import-export-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportExportToolComponent implements OnInit {

  @Input() projectionsLimitations: ProjectionsLimitationsOptions;

  @Input() selectFirstProj: boolean = false;

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  get workspaceStore(): WorkspaceStore {
    return this.workspaceState.store;
  }

  @Input() importExportType: ImportExportType = ImportExportType.layer;
  @Input() importExportShowBothType: boolean = true;

  constructor(
    private mapState: MapState,
    public importExportState: ImportExportState,
    private workspaceState: WorkspaceState,
    public contextState: ContextState
  ) {}

  ngOnInit(): void {
    this.selectType();
    this.selectMode();
  }

  private selectType() {
    if (this.importExportType) {
      this.importExportState.importExportType$.next(this.importExportType);
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
    this.importExportType = event.value;
  }
}
