import { WfsWorkspace } from './wfs-workspace';
import { FeatureWorkspace } from './feature-workspace';
import { EditionWorkspace } from './edition-workspace';
import { Observable } from 'rxjs';
import { EntityStoreFilterCustomFuncStrategy, EntityRecord, EntityTableColumnRenderer, EntityTableButton } from '@igo2/common';
import { map } from 'rxjs/operators';
import { Feature } from '../../feature/shared/feature.interfaces';
import { StorageScope } from '@igo2/core';
import { ObjectUtils } from '@igo2/utils';
import { IgoMap } from '../../map/shared/map';
import { generateIdFromSourceOptions } from '../../utils/id-generator';
import { LayerService } from '../../layer';

export function getRowsInMapExtent(layerId, storageService): boolean {
  return storageService.get(`workspace.rowsInMapExtent.${layerId}`) as boolean || true;
}

export function setRowsInMapExtent(value, layerId, storageService) {
  storageService.set(`workspace.rowsInMapExtent.${layerId}`, value, StorageScope.SESSION);
}

export function getSelectedOnly(layerId, storageService): boolean {
  return storageService.get(`workspace.selectedOnly.${layerId}`) as boolean || false;
}

export function setSelectedOnly(value, layerId, storageService) {
  storageService.set(`workspace.selectedOnly.${layerId}`, value, StorageScope.SESSION);
}

export function mapExtentStrategyActiveToolTip(ws: WfsWorkspace | FeatureWorkspace | EditionWorkspace): Observable<string> {
  return ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy).active$.pipe(
    map((active: boolean) => active ? 'igo.geo.workspace.inMapExtent.active.tooltip' : 'igo.geo.workspace.inMapExtent.inactive.tooltip')
  );
}

export function noElementSelected(ws: WfsWorkspace | FeatureWorkspace | EditionWorkspace): Observable<boolean> {
  return ws.entityStore.stateView.manyBy$((record: EntityRecord<Feature>) => {
    return record.state.selected === true;
  }).pipe(
    map((entities: EntityRecord<Feature>[]) => entities.length >= 1)
  );
}

export function addOrRemoveLayer(
  action: 'add' | 'remove',
  map: IgoMap,
  url: string,
  type: string,
  layerName: string,
  layerService: LayerService) {
  const so = ObjectUtils.removeUndefined({
    sourceOptions: {
      type: type,
      url,
      optionsFromCapabilities: true,
      optionsFromApi: true,
      params: {
        LAYERS: type === 'wms' ? layerName : undefined,
        LAYER: type === 'wms' ? undefined : layerName,
      }
    }
  });
  if (action === 'add') {
    layerService
      .createAsyncLayer(so)
      .subscribe(layer => {
        map.layersAddedByClick$.next([layer]);
        map.addLayer(layer);
      });
  } else if (action === 'remove') {
    const addedLayerId = generateIdFromSourceOptions(so.sourceOptions);
    map.removeLayer(map.layers.find(l => l.id === addedLayerId));
  }
}

export function getGeoServiceAction(workspace: FeatureWorkspace | WfsWorkspace, layerService: LayerService) {
  const geoServiceAction = [{
    name: 'geoServiceAction',
    title: undefined,
    tooltip: '',
    renderer: EntityTableColumnRenderer.ButtonGroup,
    valueAccessor: (entity: Feature, record: EntityRecord<Feature>) => {
      let geoServiceProperties = record.state.geoService;
      if (
        geoServiceProperties &&
        geoServiceProperties.haveGeoServiceProperties &&
        geoServiceProperties.url &&
        geoServiceProperties.layerName
      ) {
        if (geoServiceProperties.added) {
          return [{
            icon: 'delete',
            color: 'warn',
            click: (row, record) => {
              addOrRemoveLayer('remove', workspace.map, record.state.geoService.url,
                record.state.geoService.type, record.state.geoService.layerName, layerService);
              geoServiceProperties.added = false;
            }
          }] as EntityTableButton[];
        } else {
          return [{
            icon: 'plus',
            color: 'primary',
            click: (row, record) => {
              addOrRemoveLayer('add', workspace.map, record.state.geoService.url,
                record.state.geoService.type, record.state.geoService.layerName, layerService);
              geoServiceProperties.added = true;
            }
          }] as EntityTableButton[];
        }
      } else {
        return [];
      }
    },
  }];
  return geoServiceAction;
}
