import { WfsWorkspace } from './wfs-workspace';
import { FeatureWorkspace } from './feature-workspace';
import { Observable } from 'rxjs';
import { EntityStoreFilterCustomFuncStrategy, EntityRecord } from '@igo2/common';
import { map } from 'rxjs/operators';
import { Feature } from '../../feature/shared/feature.interfaces';

export function mapExtentStrategyActiveToolTip(ws: WfsWorkspace | FeatureWorkspace): Observable<string> {
  return ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy).active$.pipe(
    map((active: boolean) => active ? 'igo.geo.workspace.inMapExtent.active.tooltip' : 'igo.geo.workspace.inMapExtent.inactive.tooltip')
  );
}

export function featureMotionStrategyActiveToolTip(ws: WfsWorkspace | FeatureWorkspace): Observable<string> {
  return ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy).active$.pipe(
    map((active: boolean) => active ? 'igo.geo.workspace.zoomAuto.tooltip' : 'igo.geo.workspace.zoomAuto.tooltip')
  );
}

export function noElementSelected(ws: WfsWorkspace | FeatureWorkspace): Observable<boolean> {
  return ws.entityStore.stateView.manyBy$((record: EntityRecord<Feature>) => {
    return record.state.selected === true;
  }).pipe(
    map((entities: EntityRecord<Feature>[]) => entities.length >= 1)
  );
}

