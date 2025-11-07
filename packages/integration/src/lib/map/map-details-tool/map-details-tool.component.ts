import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { ToolComponent } from '@igo2/common/tool';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import { Media, MediaService } from '@igo2/core/media';
import {
  AnyLayer,
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
  SearchSourceService,
  TimeFilterButtonComponent,
  TrackFeatureButtonComponent,
  sourceCanSearch
} from '@igo2/geo';

import { Observable } from 'rxjs';

import {
  ImportExportMode,
  ImportExportState
} from '../../import-export/import-export.state';
import { WorkspaceButtonComponent } from '../../workspace';
import { ToolState } from './../../tool/tool.state';
import { MapState } from './../map.state';

@ToolComponent({
  name: 'mapDetails',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-details-tool',
  templateUrl: './map-details-tool.component.html',
  styleUrls: ['./map-details-tool.component.scss'],
  imports: [
    LayerViewerComponent,
    WorkspaceButtonComponent,
    ExportButtonComponent,
    OgcFilterButtonComponent,
    TimeFilterButtonComponent,
    TrackFeatureButtonComponent,
    MetadataButtonComponent,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class MapDetailsToolComponent implements OnInit {
  private mapState = inject(MapState);
  private toolState = inject(ToolState);
  private searchSourceService = inject(SearchSourceService);
  private importExportState = inject(ImportExportState);
  private configService = inject(ConfigService);
  mediaService = inject(MediaService);
  private cdr = inject(ChangeDetectorRef);

  isDesktop: boolean;
  public delayedShowEmptyMapContent = false;

  @Input() toggleLegendOnVisibilityChange = false;

  @Input() expandLegendOfVisibleLayers = false;

  @Input() updateLegendOnResolutionChange = false;

  @Input() ogcButton = true;

  @Input() timeButton = true;

  @Input() layerListControls: LayerListControlsOptions = {};

  @Input() queryBadge = false;

  @Input() layerAdditionAllowed = true;

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

  get map(): IgoMap {
    return this.mapState.map;
  }

  get layers$(): Observable<AnyLayer[]> {
    return this.map.layerController.all$;
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

  constructor() {
    this._layerViewerOptions = this.configService.getConfig('layer');
  }

  ngOnInit(): void {
    this.handleMedia();

    // prevent message to be shown too quickly. Waiting for layers
    setTimeout(() => {
      this.delayedShowEmptyMapContent = true;
      this.cdr.detectChanges();
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

  private handleMedia(): void {
    this.mediaService.media$.subscribe((result) => {
      this.isDesktop = result === Media.Desktop;
      this.cdr.detectChanges();
    });
  }
}
