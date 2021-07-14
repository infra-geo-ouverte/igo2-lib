import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TransferedTile } from './TransferedTile';
import { MapState } from '../map';
import { FeatureStore } from '@igo2/geo';

@Injectable({
   providedIn: 'root'
 })
export class DownloadState {

    readonly addNewTile$: BehaviorSubject<TransferedTile> = new BehaviorSubject(undefined);
    private _openedWithMouse: boolean = false;
    public regionStore: FeatureStore = new FeatureStore([], { map: this.map });
    readonly rightMouseClick$: Subject<boolean> = new Subject();

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

    get openedWithMouse(): boolean {
        return this._openedWithMouse;
    }

    set rightMouseClick(value: boolean) {
        this.rightMouseClick$.next(value);
    }
}
