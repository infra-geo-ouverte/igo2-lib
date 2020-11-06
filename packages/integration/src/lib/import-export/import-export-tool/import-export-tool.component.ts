import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import type { WorkspaceStore } from '@igo2/common';
import { IgoMap, ExportOptions } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { ImportExportState } from '../import-export.state';
import { WorkspaceState } from '../../workspace/workspace.state';

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
  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  get workspaceStore(): WorkspaceStore {
    return this.workspaceState.store;
  }

  public importExportType$: string = 'layer';

  constructor(
    private mapState: MapState,
    public importExportState: ImportExportState,
    private workspaceState: WorkspaceState,
  ) {}

  ngOnInit(): void {
    this.selectMode();
  }

  private selectMode() {
    const userSelectedMode = this.importExportState.selectedMode$.value;
    if (userSelectedMode !== undefined) {
      this.importExportState.setMode(userSelectedMode);
    } else {
      this.importExportState.setMode('import');

    }
  }

  public modeChanged(mode: string) {
    this.importExportState.setMode(mode);
  }

  public exportOptionsChange(exportOptions: ExportOptions) {
    this.importExportState.setsExportOptions(exportOptions);
  }

  importExportTypeChange(event) {
    this.importExportType$ = event.value;
  }
}
