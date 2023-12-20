import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import {
  ExportOptions,
  IgoMap,
  Layer,
  LayerListControlsEnum,
  LayerListControlsOptions
} from '@igo2/geo';

import {
  ImportExportMode,
  ImportExportState
} from '../../import-export/import-export.state';
import { ToolState } from '../../tool/tool.state';
import { MapState } from './../map.state';
import { TranslateModule } from '@ngx-translate/core';
import { ContextListBindingDirective } from '../../../../../context/src/lib/context-manager/context-list/context-list-binding.directive';
import { ContextListComponent } from '../../../../../context/src/lib/context-manager/context-list/context-list.component';
import { MetadataButtonComponent } from '../../../../../geo/src/lib/metadata/metadata-button/metadata-button.component';
import { TrackFeatureButtonComponent } from '../../../../../geo/src/lib/layer/track-feature-button/track-feature-button.component';
import { TimeFilterButtonComponent } from '../../../../../geo/src/lib/filter/time-filter-button/time-filter-button.component';
import { OgcFilterButtonComponent } from '../../../../../geo/src/lib/filter/ogc-filter-button/ogc-filter-button.component';
import { ExportButtonComponent } from '../../../../../geo/src/lib/import-export/export-button/export-button.component';
import { WorkspaceButtonComponent } from '../../workspace/workspace-button/workspace-button.component';
import { LayerListBindingDirective } from '../../../../../geo/src/lib/layer/layer-list/layer-list-binding.directive';
import { LayerListComponent } from '../../../../../geo/src/lib/layer/layer-list/layer-list.component';
import { MatTabsModule } from '@angular/material/tabs';

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
    imports: [MatTabsModule, LayerListComponent, LayerListBindingDirective, WorkspaceButtonComponent, ExportButtonComponent, OgcFilterButtonComponent, TimeFilterButtonComponent, TrackFeatureButtonComponent, MetadataButtonComponent, ContextListComponent, ContextListBindingDirective, TranslateModule]
})
export class MapToolComponent {
  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() ogcButton: boolean = true;

  @Input() timeButton: boolean = true;

  @Input() layerListControls: LayerListControlsOptions = {};

  @Input() queryBadge: boolean = false;

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
