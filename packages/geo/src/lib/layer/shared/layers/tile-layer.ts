import olLayerTile from 'ol/layer/Tile';
import olSourceTile from 'ol/source/Tile';
import TileState from 'ol/TileState';

import { TileWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { OSMDataSource } from '../../../datasource/shared/datasources/osm-datasource';
import { WMTSDataSource } from '../../../datasource/shared/datasources/wmts-datasource';
import { XYZDataSource } from '../../../datasource/shared/datasources/xyz-datasource';
import { CartoDataSource } from '../../../datasource/shared/datasources/carto-datasource';
import { TileArcGISRestDataSource } from '../../../datasource/shared/datasources/tilearcgisrest-datasource';
import { TileDebugDataSource } from '../../../datasource/shared/datasources/tiledebug-datasource';

import { Layer } from './layer';
import { TileLayerOptions } from './tile-layer.interface';
import { GeoNetworkService } from '@igo2/core';
import { first } from 'rxjs/operators';

import { MessageService } from '@igo2/core';
export class TileLayer extends Layer {
  public dataSource:
    | OSMDataSource
    | WMTSDataSource
    | XYZDataSource
    | TileDebugDataSource
    | CartoDataSource
    | TileArcGISRestDataSource;
  public options: TileLayerOptions;
  public ol: olLayerTile<olSourceTile>;

  private watcher: TileWatcher;

  constructor(
    options: TileLayerOptions,
    private geoNetwork: GeoNetworkService,
    public messageService?: MessageService
    ) {
    super(options, messageService);

    this.watcher = new TileWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): olLayerTile<olSourceTile> {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceTile
    });

    const newTile = new olLayerTile(olOptions);

    (newTile.getSource() as any).setTileLoadFunction((tile, src) => {
      this.customLoader(tile, src);
    });
    return newTile;
  }

  // TODO Type of tile
  private customLoader(tile , src: string) {
    const request = this.geoNetwork.get(src);
    request.pipe(first())
    .subscribe((blob) => {
      // need error state handler for tile
      // https://openlayers.org/en/latest/apidoc/module-ol_Tile.html#~LoadFunction
      if (blob) {
        const urlCreator = window.URL;
        const imageUrl = urlCreator.createObjectURL(blob);
        tile.getImage().src = imageUrl;
        tile.getImage().onload = function() {
          URL.revokeObjectURL(this.src);
        };
      } else {
        tile.setState(TileState.ERROR);
      }
    });
  }

  public setMap(map: IgoMap | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => {});
    }
    super.setMap(map);
  }
}
