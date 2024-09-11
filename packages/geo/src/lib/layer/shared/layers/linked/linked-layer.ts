import {
  findLayerByLinkId,
  getLayersByDeletion,
  handleLayerPropertyChange
} from '../../../../map/shared/linkedLayers.utils';
import {
  LayerWatcher,
  LayerWatcherChange
} from '../../../../map/utils/layer-watcher';
import { isLayerItem, sortLayersByZindex } from '../../../utils/layer.utils';
import type { LayerController } from '../../layer-controller';
import type { AnyLayer } from '../any-layer';
import type { Layer } from '../layer';
import type { LayerGroup } from '../layer-group';
import {
  AnyPropertyOptions,
  LayersLinkProperties,
  LinkedProperties,
  ZindexPropertyOptions
} from './linked-layer.interface';

export class Linked {
  private children: Layer[] = [];
  private watcher = new LayerWatcher();
  private bidirectionnalChildren: Layer[] = [];
  private childrenByProperty = new Map<LinkedProperties, AnyPropertyOptions>();
  private disabledProperties: LinkedProperties[] = [];

  constructor(public layer: Layer) {
    this.init();

    this.watcher.watchLayer(layer);

    this.watcher.propertyChange$.subscribe((change) => {
      if (!change) {
        return;
      }
      this.handleChange(change);
    });
  }

  get options() {
    return this.layer.options;
  }

  get links() {
    return this.layer.options.linkedLayers.links!;
  }

  get map() {
    return this.layer.map;
  }

  init(): void {
    const children = this.findChildren(
      this.map.layerController.all,
      this.links
    );

    this.links.forEach((link) => {
      link.properties.forEach((property) => {
        let options = this.getByProperty(property);

        if (property === LinkedProperties.ZINDEX) {
          const layers = [this.layer, ...children];
          options = this.initZIndexLinkOptions(
            options as ZindexPropertyOptions,
            layers
          );
        }

        this.childrenByProperty.set(property, options);
      });
    });

    children.forEach((child) => this.add(child));
  }

  private initZIndexLinkOptions(
    options: ZindexPropertyOptions,
    layers: Layer[]
  ) {
    options.initialOrder = sortLayersByZindex(layers, 'desc');

    return options;
  }

  destroy(): void {
    this.children.forEach((child) => {
      this.remove(child);
    });
    this.unwatch();
  }

  add(layer: Layer): void {
    if (!this.children.includes(layer)) {
      this.children.push(layer);
    }

    this.getLayerLinks(layer).forEach((link) => {
      if (link.bidirectionnal) {
        if (this.bidirectionnalChildren.includes(layer)) {
          return;
        }
        this.bidirectionnalChildren.push(layer);
        this.watcher.watchLayer(layer);
      }

      link.properties.forEach((property) => {
        const options = this.getByProperty(property);
        if (options.layers.includes(layer)) {
          return;
        }

        // We have a property displayed for layer out of resolution or in a group
        // If the visiblity is linked, we need to reflect the displayed value
        if (property === LinkedProperties.VISIBLE && !layer.showInLayerList) {
          const displayedOptions = this.getByProperty(
            LinkedProperties.DISPLAYED
          );
          displayedOptions.layers.push(layer);
          this.childrenByProperty.set(
            LinkedProperties.DISPLAYED,
            displayedOptions
          );
        }

        if (property === LinkedProperties.ZINDEX) {
          const zIndexOptions = options as ZindexPropertyOptions;
          if (!zIndexOptions.initialOrder.includes(layer)) {
            zIndexOptions.initialOrder = sortLayersByZindex(
              [...zIndexOptions.initialOrder, layer],
              'desc'
            );
          }
        }

        options.layers.push(layer);
        this.childrenByProperty.set(property, options);

        if (layer[property] !== this.layer[property]) {
          this.handleChange({
            event: {
              key: property,
              oldValue: layer[property],
              value: this.layer[property]
            },
            layer: this.layer
          });
        }
      });
    });
  }

  hasSyncDeletion(layer: Layer): boolean {
    return this.getLayerLinks(layer).some((link) => link.syncedDelete);
  }

  remove(layer: Layer): void {
    layer.linkMaster = undefined;
    this.removeArrayItem(layer, this.children, 'id');

    this.getLayerLinks(layer).forEach((link) => {
      if (link.bidirectionnal) {
        this.watcher.unwatchLayer(layer);
      }

      link.properties.forEach((property) => {
        const options = this.getByProperty(property);
        this.removeArrayItem(layer, options.layers, 'id');
        this.childrenByProperty.set(property, options);
      });
    });
  }

  deleteChildren(controller: LayerController): void {
    const layers = getLayersByDeletion(this.children, this.links);
    layers?.forEach((layer) => {
      this.remove(layer);
      controller.remove(layer);
    });
  }

  move(layer: Layer, parent?: LayerGroup): void {
    if (this.propertyIsDisabled(LinkedProperties.ZINDEX)) {
      return;
    }

    const options = this.getByProperty(
      LinkedProperties.ZINDEX
    ) as ZindexPropertyOptions;
    if (!options.layers.length) {
      return;
    }

    const linkedLayers = this.getLinkedLayersOnZindex(layer.id);

    this.disable(LinkedProperties.ZINDEX);

    const index = options.initialOrder.findIndex((l) => l.id === layer.id);
    linkedLayers?.forEach((linkLayer) => {
      if (!linkLayer.showInLayerList) {
        linkLayer.zIndex = layer.zIndex;
        if (parent !== linkLayer.parent) {
          linkLayer.reset(parent);
        }
        return;
      }

      const linkedIndex = options.initialOrder.findIndex(
        (l) => l.id === linkLayer.id
      );
      linkedIndex < index
        ? this.map.layerController.moveAbove(layer, linkLayer)
        : this.map.layerController.moveBelow(layer, linkLayer);
    });

    this.enable(LinkedProperties.ZINDEX);
  }

  private disable(...properties: LinkedProperties[]): void {
    properties.forEach((property) => {
      if (this.disabledProperties.includes(property)) {
        return;
      }
      this.disabledProperties.push(property);
    });

    this.bidirectionnalChildren.forEach((layer) => {
      this.watcher.unwatchLayer(layer);
    });
  }

  private enable(...properties: LinkedProperties[]): void {
    properties.forEach((property) => {
      const index = this.disabledProperties.findIndex(
        (disableProperty) => disableProperty === property
      );
      if (index > -1) {
        this.disabledProperties.splice(index, 1);
      }
    });

    this.bidirectionnalChildren.forEach((layer) => {
      this.watcher.watchLayer(layer);
    });
  }

  private getByProperty(property: LinkedProperties): AnyPropertyOptions {
    return this.childrenByProperty.get(property) ?? { layers: [] };
  }

  private propertyIsDisabled(property: LinkedProperties): boolean {
    return this.disabledProperties.includes(property);
  }

  private getLayerLinks(layer: Layer): LayersLinkProperties[] {
    const linkId = layer.options.linkedLayers!.linkId;
    return this.links.filter((link) => link.linkedIds.includes(linkId));
  }

  private removeArrayItem<T extends { id: string }>(
    item: T,
    array: T[],
    key: keyof T = 'id'
  ) {
    const index = array.findIndex((n) => n[key] === item[key]);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  private getLinkedLayersOnZindex(id: string): Layer[] {
    return [...this.getByProperty(LinkedProperties.ZINDEX).layers]
      ?.concat(this.layer)
      .filter((layer) => layer.id !== id);
  }

  private unwatch(): void {
    this.watcher.unwatch();
  }

  private handleChange = (change: LayerWatcherChange) => {
    const isMasterChage = change.layer.id === this.layer.id;

    const property = change.event.key as LinkedProperties;
    if (this.propertyIsDisabled(property)) {
      return;
    }

    const options = this.getByProperty(property);
    let layers = [...options.layers];
    if (!layers?.length && isMasterChage) {
      return;
    }

    if (!isMasterChage) {
      layers = layers.filter((n) => n.id !== change.layer.id);
      layers.push(this.layer);
    }

    if (property === LinkedProperties.DISPLAYED && isMasterChage) {
      return this.handleDisplayChange(change, layers);
    }

    handleLayerPropertyChange(layers, change, this.map.viewController);
  };

  private handleDisplayChange(change: LayerWatcherChange, children: Layer[]) {
    const affectedProperties = [
      LinkedProperties.DISPLAYED,
      LinkedProperties.VISIBLE
    ];
    this.disable(...affectedProperties);
    children.forEach((child) => {
      if (!child.showInLayerList) {
        child.visible = !!change.event.value;
      }
    });
    this.enable(...affectedProperties);
  }

  private findChildren(
    layers: AnyLayer[],
    links: LayersLinkProperties[]
  ): Layer[] {
    const layersFiltered = layers.filter((n) => isLayerItem(n)) as Layer[];

    return links.reduce((linked: Layer[], link) => {
      const layerFromLink = link.linkedIds
        .map((id) => {
          return findLayerByLinkId(layersFiltered, id);
        })
        .filter(Boolean);

      return linked.concat(layerFromLink);
    }, []);
  }
}
