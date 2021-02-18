import { WfsWorkspace } from './wfs-workspace';
import { FeatureWorkspace } from './feature-workspace';
import { Observable } from 'rxjs';
import { EntityStoreFilterCustomFuncStrategy, EntityRecord } from '@igo2/common';
import { map } from 'rxjs/operators';
import { Feature } from '../../feature/shared/feature.interfaces';
import { StorageScope } from '@igo2/core';


export function getRowsInMapExtent(storageService): boolean {
  return storageService.get(`workspace.rowsInMapExtent`) as boolean || true;
}

export function setRowsInMapExtent(value, storageService) {
  storageService.set(`workspace.rowsInMapExtent`, value, StorageScope.SESSION);
}

export function getSelectedOnly(storageService): boolean {
  return storageService.get(`workspace.selectedOnly`) as boolean || false;
}

export function setSelectedOnly(value, storageService) {
  storageService.set(`workspace.selectedOnly`, value, StorageScope.SESSION);
}

export function mapExtentStrategyActiveToolTip(ws: WfsWorkspace | FeatureWorkspace): Observable<string> {
  return ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy).active$.pipe(
    map((active: boolean) => active ? 'igo.geo.workspace.inMapExtent.active.tooltip' : 'igo.geo.workspace.inMapExtent.inactive.tooltip')
  );
}

export function noElementSelected(ws: WfsWorkspace | FeatureWorkspace): Observable<boolean> {
  return ws.entityStore.stateView.manyBy$((record: EntityRecord<Feature>) => {
    return record.state.selected === true;
  }).pipe(
    map((entities: EntityRecord<Feature>[]) => entities.length >= 1)
  );
}

