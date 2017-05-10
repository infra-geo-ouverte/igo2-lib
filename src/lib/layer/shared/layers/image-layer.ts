import { DataSource } from '../../../datasource';

import { ImageWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';


export class ImageLayer extends Layer {

  public options: ImageLayerOptions;
  public ol: ol.layer.Image;

  private watcher: ImageWatcher;

  constructor(dataSource: DataSource, options?: ImageLayerOptions) {
    super(dataSource, options);

    this.watcher = new ImageWatcher(this.dataSource.ol as ol.source.Image);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): ol.layer.Image {
    const olOptions = Object.assign({}, this.options.view || {}, {
      source: this.dataSource.ol as ol.source.Image
    });

    return new ol.layer.Image(olOptions);
  }

  public add(map: IgoMap) {
    this.watcher.subscribe(() => {});
    super.add(map);
  }

  public remove() {
    this.watcher.unsubscribe();
    super.remove();
  }
}
