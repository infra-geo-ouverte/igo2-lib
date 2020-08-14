import { WfsWorkspace } from './wfs-workspace';
import { FeatureWorkspace } from './feature-workspace';
import { Observable } from 'rxjs';
import { EntityStoreFilterCustomFuncStrategy } from '@igo2/common';
import { map } from 'rxjs/operators';

export function mapExtentStrategyActiveToolTip(ws: WfsWorkspace | FeatureWorkspace): Observable<string> {
    return ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy).active$.pipe(
      map((active: boolean) => active ? 'igo.geo.workspace.inMapExtent.active.tooltip' : 'igo.geo.workspace.inMapExtent.inactive.tooltip')
    );
  }

export function FeatureMotionStrategyActiveToolTip(ws: WfsWorkspace | FeatureWorkspace): Observable<string> {
  return ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy).active$.pipe(
    map((active: boolean) => active ? 'igo.geo.workspace.zoomAuto.tooltip' : 'igo.geo.workspace.zoomAuto.tooltip')
  );
}

