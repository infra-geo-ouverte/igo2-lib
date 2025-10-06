import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ToolComponent } from '@igo2/common/tool';
import {
  ContextListBindingDirective,
  ContextListComponent
} from '@igo2/context';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import { Media, MediaService } from '@igo2/core/media';
import {
  ExportButtonComponent,
  ExportOptions,
  IgoMap,
  Layer,
  LayerListControlsEnum,
  LayerListControlsOptions,
  LayerViewerComponent,
  LayerViewerOptions,
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
  imports: [
    MatTabsModule,
    WorkspaceButtonComponent,
    ExportButtonComponent,
    OgcFilterButtonComponent,
    TimeFilterButtonComponent,
    TrackFeatureButtonComponent,
    MetadataButtonComponent,
    LayerViewerComponent,
    ContextListComponent,
    ContextListBindingDirective,
    IgoLanguageModule
  ]
})
export class MapToolComponent implements OnInit {
  private mapState = inject(MapState);
  private toolState = inject(ToolState);
  private importExportState = inject(ImportExportState);
  private configService = inject(ConfigService);
  mediaService = inject(MediaService);
  private cdr = inject(ChangeDetectorRef);

  isDesktop: boolean;

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

  private _layerViewerOptions: Partial<LayerViewerOptions>;
  get layerViewerOptions(): LayerViewerOptions {
    return {
      filterAndSortOptions: this.layerFilterAndSortOptions,
      legend: {
        showForVisibleLayers: this.expandLegendOfVisibleLayers,
        showOnVisibilityChange: this.toggleLegendOnVisibilityChange,
        updateOnResolutionChange: this.updateLegendOnResolutionChange
      },
      queryBadge: this.queryBadge,
      ...this._layerViewerOptions
    };
  }

  constructor() {
    this._layerViewerOptions = this.configService.getConfig('layer');
  }

  ngOnInit(): void {
    this.handleMedia();
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

  private handleMedia(): void {
    this.mediaService.media$.subscribe((result) => {
      this.isDesktop = result === Media.Desktop;
      this.cdr.detectChanges();
    });
  }
}
