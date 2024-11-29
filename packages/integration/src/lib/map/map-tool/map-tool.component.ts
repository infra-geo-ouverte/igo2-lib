import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ToolComponent } from '@igo2/common/tool';
import {
  ContextListBindingDirective,
  ContextListComponent
} from '@igo2/context';
import { IgoLanguageModule } from '@igo2/core/language';
import {
  ExportButtonComponent,
  ExportOptions,
  IgoMap,
  Layer,
  LayerListBindingDirective,
  LayerListComponent,
  LayerListControlsEnum,
  LayerListControlsOptions,
  MetadataButtonComponent,
  OgcFilterButtonComponent,
  TimeFilterButtonComponent,
  TrackFeatureButtonComponent
} from '@igo2/geo';

import {
  ImportExportMode,
  ImportExportState
} from '../../import-export/import-export.state';
import { ToolState } from '../../tool/tool.state';
import { WorkspaceButtonComponent } from '../../workspace/workspace-button/workspace-button.component';
import { MapState } from './../map.state';

/**
 * Tool to browse a map's layers or to choose a different map
 */
@ToolComponent({
  name: 'map',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-tool',
  templateUrl: './map-tool.component.html',
  styleUrls: ['./map-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatTabsModule,
    LayerListComponent,
    LayerListBindingDirective,
    WorkspaceButtonComponent,
    ExportButtonComponent,
    OgcFilterButtonComponent,
    TimeFilterButtonComponent,
    TrackFeatureButtonComponent,
    MetadataButtonComponent,
    ContextListComponent,
    ContextListBindingDirective,
    IgoLanguageModule
  ]
})
export class MapToolComponent {
  @Input() toggleLegendOnVisibilityChange = false;

  @Input() expandLegendOfVisibleLayers = false;

  @Input() updateLegendOnResolutionChange = false;

  @Input() ogcButton = true;

  @Input() timeButton = true;

  @Input() layerListControls: LayerListControlsOptions = {};

  @Input() queryBadge = false;

  get map(): IgoMap {
    return this.mapState.map;
  }

  get excludeBaseLayers(): boolean {
    return this.layerListControls.excludeBaseLayers || false;
  }

  get layerFilterAndSortOptions(): any {
    const filterSortOptions = Object.assign(
      {
        showToolbar: LayerListControlsEnum.default
      },
      this.layerListControls
    );

    switch (this.layerListControls.showToolbar) {
      case LayerListControlsEnum.always:
        filterSortOptions.showToolbar = LayerListControlsEnum.always;
        break;
      case LayerListControlsEnum.never:
        filterSortOptions.showToolbar = LayerListControlsEnum.never;
        break;
      default:
        break;
    }
    return filterSortOptions;
  }

  constructor(
    private mapState: MapState,
    private toolState: ToolState,
    private importExportState: ImportExportState
  ) {}

  activateExport(layer: Layer) {
    let id = layer.id;
    if (layer.options.workspace?.workspaceId) {
      id =
        layer.options.workspace.workspaceId !== layer.id
          ? layer.options.workspace.workspaceId
          : layer.id;
    }
    this.importExportState.setsExportOptions({ layers: [id] } as ExportOptions);
    this.importExportState.setMode(ImportExportMode.export);
    this.toolState.toolbox.activateTool('importExport');
  }
}
