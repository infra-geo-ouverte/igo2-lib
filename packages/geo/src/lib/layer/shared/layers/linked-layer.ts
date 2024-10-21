import {
  findLayerByLinkId,
  getLayersByDeletion,
  handleLayerPropertyChange
} from '../../../map/shared/linkedLayers.utils';
import {
  LayerWatcher,
  LayerWatcherChange
} from '../../../map/utils/layer-watcher';
import { isLayerItem } from '../../utils/layer.utils';
import type { AnyLayer } from './any-layer';
import type { Layer } from './layer';
import type { LayerGroup } from './layer-group';
import { LayersLinkProperties, LinkedProperties } from './layer.interface';

export class Linked {
  children: Layer[] = [];
  watcher = new LayerWatcher();
  bidirectionnalChildren: Layer[] = [];
  private childrenByProperty = new Map<LinkedProperties, Layer[]>();
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
    children.forEach((child) => this.add(child));
  }

  destroy(): void {
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
        const layers = this.childrenByProperty.get(property) ?? [];
        if (layers.includes(layer)) {
          return;
        }

        // We have a property displayed for layer out of resolution or in a group
        // If the visiblity is linked, we need to reflect the displayed value
        if (property === LinkedProperties.VISIBLE && !layer.showInLayerList) {
          const layersDisplayed =
            this.childrenByProperty.get(LinkedProperties.DISPLAYED) ?? [];
          this.childrenByProperty.set(
            LinkedProperties.DISPLAYED,
            layersDisplayed.concat(layer)
          );
        }

        this.childrenByProperty.set(property, layers.concat(layer));

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

  private getLayerLinks(layer: Layer): LayersLinkProperties[] {
    const linkId = layer.options.linkedLayers!.linkId;
    return this.links.filter((link) => link.linkedIds.includes(linkId));
  }

  remove(layer: Layer): void {
    this.removeArrayItem(layer, this.children, 'id');

    this.getLayerLinks(layer).forEach((link) => {
      if (link.bidirectionnal) {
        this.watcher.unwatchLayer(layer);
      }

      link.properties.forEach((property) => {
        const layers = this.childrenByProperty.get(property) ?? [];
        this.removeArrayItem(layer, layers, 'id');
        this.childrenByProperty.set(property, layers);
      });
    });
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

  deleteChildren(): void {
    const layers = getLayersByDeletion(this.children, this.links);
    layers?.forEach((layer) => {
      this.remove(layer);
      layer.remove(false);
    });
  }

  getByProperty(property: LinkedProperties): Layer[] | undefined {
    if (this.disabledProperties.includes(property)) {
      return;
    }
    return this.childrenByProperty.get(property);
  }

  disable(...properties: LinkedProperties[]): void {
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

  enable(...properties: LinkedProperties[]): void {
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

  move(layer: Layer, parent?: LayerGroup): void {
    const linkedLayers = this.getLinkedLayersOnZindex(layer.id);

    this.disable(LinkedProperties.ZINDEX);

    linkedLayers.forEach((linkLayer) => {
      if (!linkLayer.showInLayerList) {
        linkLayer.zIndex = layer.zIndex;
        if (parent !== linkLayer.parent) {
          linkLayer.reset(parent);
        }
        return;
      }
      this.map.layerController.moveBelow(layer, linkLayer);
    });

    this.enable(LinkedProperties.ZINDEX);
  }

  private getLinkedLayersOnZindex(id: string): Layer[] {
    return (this.getByProperty(LinkedProperties.ZINDEX) ?? [])
      .concat(this.layer)
      .filter((layer) => layer.id !== id);
  }

  private unwatch(): void {
    this.watcher.unwatch();
  }

  private handleChange = (change: LayerWatcherChange) => {
    const isMasterChage = change.layer.id === this.layer.id;

    let children =
      this.childrenByProperty.get(change.event.key as LinkedProperties) ?? [];
    if (!children?.length && isMasterChage) {
      return;
    }

    if (!isMasterChage) {
      children = children.filter((n) => n.id !== change.layer.id);
      children.push(this.layer);
    }

    if (change.event.key === LinkedProperties.DISPLAYED && isMasterChage) {
      return this.handleDisplayChange(change, children);
    }

    handleLayerPropertyChange(children, change, this.map.viewController);
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
