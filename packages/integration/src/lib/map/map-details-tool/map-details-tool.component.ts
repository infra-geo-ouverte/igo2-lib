import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import {
  ExportOptions,
  IgoMap,
  Layer,
  LayerListControlsEnum,
  LayerListControlsOptions,
  SearchSourceService,
  sourceCanSearch
} from '@igo2/geo';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ImportExportMode,
  ImportExportState
} from '../../import-export/import-export.state';
import { ToolState } from './../../tool/tool.state';
import { MapState } from './../map.state';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MetadataButtonComponent } from '../../../../../geo/src/lib/metadata/metadata-button/metadata-button.component';
import { TrackFeatureButtonComponent } from '../../../../../geo/src/lib/layer/track-feature-button/track-feature-button.component';
import { TimeFilterButtonComponent } from '../../../../../geo/src/lib/filter/time-filter-button/time-filter-button.component';
import { OgcFilterButtonComponent } from '../../../../../geo/src/lib/filter/ogc-filter-button/ogc-filter-button.component';
import { ExportButtonComponent } from '../../../../../geo/src/lib/import-export/export-button/export-button.component';
import { WorkspaceButtonComponent } from '../../workspace/workspace-button/workspace-button.component';
import { LayerListBindingDirective } from '../../../../../geo/src/lib/layer/layer-list/layer-list-binding.directive';
import { LayerListComponent } from '../../../../../geo/src/lib/layer/layer-list/layer-list.component';
import { NgIf, AsyncPipe } from '@angular/common';

@ToolComponent({
  name: 'mapDetails',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
    selector: 'igo-map-details-tool',
    templateUrl: './map-details-tool.component.html',
    styleUrls: ['./map-details-tool.component.scss'],
    standalone: true,
    imports: [NgIf, LayerListComponent, LayerListBindingDirective, WorkspaceButtonComponent, ExportButtonComponent, OgcFilterButtonComponent, TimeFilterButtonComponent, TrackFeatureButtonComponent, MetadataButtonComponent, MatListModule, MatIconModule, AsyncPipe, TranslateModule]
})
export class MapDetailsToolComponent implements OnInit {
  public delayedShowEmptyMapContent: boolean = false;

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() ogcButton: boolean = true;

  @Input() timeButton: boolean = true;

  @Input() layerListControls: LayerListControlsOptions = {};

  @Input() queryBadge: boolean = false;

  @Input() layerAdditionAllowed: boolean = true;

  get map(): IgoMap {
    return this.mapState.map;
  }

  get layers$(): Observable<Layer[]> {
    return this.map.layers$.pipe(
      map((layers) =>
        layers.filter(
          (layer) =>
            layer.showInLayerList !== false &&
            (!this.excludeBaseLayers || !layer.baseLayer)
        )
      )
    );
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

  get searchToolInToolbar(): boolean {
    return (
      this.toolState.toolbox.getToolbar().indexOf('searchResults') !== -1 &&
      this.searchSourceService
        .getSources()
        .filter(sourceCanSearch)
        .filter((s) => s.available && s.getType() === 'Layer').length > 0
    );
  }

  get catalogToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('catalog') !== -1;
  }

  get contextToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('contextManager') !== -1;
  }

  constructor(
    private mapState: MapState,
    private toolState: ToolState,
    private searchSourceService: SearchSourceService,
    private cdRef: ChangeDetectorRef,
    private importExportState: ImportExportState
  ) {}

  ngOnInit(): void {
    // prevent message to be shown too quickly. Waiting for layers
    setTimeout(() => {
      this.delayedShowEmptyMapContent = true;
      this.cdRef.detectChanges();
    }, 250);
  }

  searchEmit() {
    this.toolState.toolbox.activateTool('searchResults');
  }

  catalogEmit() {
    this.toolState.toolbox.activateTool('catalog');
  }

  contextEmit() {
    this.toolState.toolbox.activateTool('contextManager');
  }

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
