import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TransferedTile } from './TransferedTile';
import { MapState } from '../map';
import { FeatureStore } from '@igo2/geo';

@Injectable({
   providedIn: 'root'
 })
export class DownloadState {

    readonly addNewTile$: BehaviorSubject<TransferedTile> = new BehaviorSubject(undefined);
    private _openedWithMouse: boolean;
    public regionStore: FeatureStore = new FeatureStore([], { map: this.map })

    constructor(private mapState: MapState) {}

    public get map() {
        return this.mapState.map;
    }
    
    addNewTileToDownload(tile: TransferedTile) {
        if (!tile) {
            return;
        }
        this.addNewTile$.next(tile);
    }

    set openedWithMouse(value: boolean) {
        this._openedWithMouse = value;
    }

    get openedWithMouse() {
        if (this._openedWithMouse === undefined) {
            return true;
        }
        const out = this._openedWithMouse;
        this._openedWithMouse = false;
        return out;
    }
}
