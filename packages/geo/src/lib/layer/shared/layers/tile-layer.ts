import { AuthInterceptor } from '@igo2/auth';
import { MessageService } from '@igo2/core/message';

import Tile from 'ol/Tile';
import olLayerTile from 'ol/layer/Tile';
import olSourceTile from 'ol/source/Tile';

import { CartoDataSource } from '../../../datasource/shared/datasources/carto-datasource';
import { OSMDataSource } from '../../../datasource/shared/datasources/osm-datasource';
import { TileArcGISRestDataSource } from '../../../datasource/shared/datasources/tilearcgisrest-datasource';
import { TileDebugDataSource } from '../../../datasource/shared/datasources/tiledebug-datasource';
import { WMTSDataSource } from '../../../datasource/shared/datasources/wmts-datasource';
import { XYZDataSource } from '../../../datasource/shared/datasources/xyz-datasource';
import { IgoMap } from '../../../map/shared/map';
import { TileWatcher } from '../../utils/tile-watcher';
import { Layer } from './layer';
import { TileLayerOptions } from './tile-layer.interface';

export class TileLayer extends Layer {
  public declare dataSource:
    | OSMDataSource
    | WMTSDataSource
    | XYZDataSource
    | TileDebugDataSource
    | CartoDataSource
    | TileArcGISRestDataSource;
  public declare options: TileLayerOptions;
  public declare ol: olLayerTile<olSourceTile>;

  private watcher: TileWatcher;

  constructor(
    options: TileLayerOptions,
    public messageService?: MessageService,
    public authInterceptor?: AuthInterceptor
  ) {
    super(options, messageService);

    this.watcher = new TileWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): olLayerTile<olSourceTile> {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol
    });
    const tileLayer = new olLayerTile(olOptions);
    const tileSource = tileLayer.getSource();
    tileSource.setTileLoadFunction((tile: Tile, url: string) => {
      this.customLoader(tile, url, this.authInterceptor);
    });

    return tileLayer;
  }

  /**
   * Custom loader for tile layer.
   * @internal
   * @param tile the current tile
   * @param url the url string or function to retrieve the data
   */
  customLoader(tile, url: string, interceptor: AuthInterceptor) {
    const alteredUrlWithKeyAuth = interceptor.alterUrlWithKeyAuth(url);
    let modifiedUrl = url;
    if (alteredUrlWithKeyAuth) {
      modifiedUrl = alteredUrlWithKeyAuth;
    }
    tile.getImage().src = modifiedUrl;
  }

  public setMap(map: IgoMap | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => void 1);
    }
    super.setMap(map);
  }
}
