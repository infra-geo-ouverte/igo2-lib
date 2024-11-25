import { Injectable } from '@angular/core';

import { ToolService, Toolbox } from '@igo2/common/tool';
import { ExportOptions } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

import {
  ImportExportMode,
  ImportExportState
} from '../import-export/import-export.state';

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class ToolState {
  get toolbox(): Toolbox {
    return this.toolService.toolbox;
  }

  public openSidenav$ = new BehaviorSubject<boolean>(undefined);

  constructor(
    private toolService: ToolService,
    private importExportState: ImportExportState
  ) {}

  toolToActivateFromOptions(toolToActivate: {
    tool: string;
    options: Record<string, any>;
  }) {
    if (!toolToActivate) {
      return;
    }
    if (toolToActivate.tool === 'importExport') {
      let exportOptions: ExportOptions =
        this.importExportState.exportOptions$.value;
      if (!exportOptions) {
        exportOptions = {
          layers: toolToActivate.options.layers,
          featureInMapExtent: toolToActivate.options.featureInMapExtent
        };
      } else {
        exportOptions.layers = toolToActivate.options.layers;
        exportOptions.featureInMapExtent =
          toolToActivate.options.featureInMapExtent;
      }
      this.importExportState.setsExportOptions(exportOptions);
      this.importExportState.setMode(ImportExportMode.export);
    }

    if (this.toolbox.getTool(toolToActivate.tool)) {
      this.toolbox.activateTool(toolToActivate.tool);
      this.openSidenav$.next(true);
    }
  }
}
