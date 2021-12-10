import { Injectable } from '@angular/core';
import {
    AnyLayer, FeatureDataSource, FeatureMotion, FeatureStore,
    FeatureStoreLoadingStrategy, StyleService, tryAddLoadingStrategy, tryBindStoreLayer, VectorLayer
} from '@igo2/geo';
import { BehaviorSubject, Subject } from 'rxjs';
import { MapState } from '../map';
import { TransferedTile } from './TransferedTile';

@Injectable({
    providedIn: 'root'
})
export class DownloadState {
    readonly selectedOfflinableLayers$: BehaviorSubject<AnyLayer[]> = new BehaviorSubject([]);
    readonly addNewTile$: BehaviorSubject<TransferedTile> = new BehaviorSubject(undefined);
    private _openedWithMouse: boolean = false;
    public regionStore: FeatureStore = new FeatureStore([], { map: this.map });
    readonly rightMouseClick$: Subject<boolean> = new Subject();


    get map() {
        return this.mapState.map;
    }

    constructor(
        private styleService: StyleService,
        private mapState: MapState) {

        this.map.ol.once('rendercomplete', () => {
            const offlineRegionsLayer = new VectorLayer({
                title: 'offlineRegionsLayer',
                zIndex: 2000,
                source: new FeatureDataSource(),
                showInLayerList: true,
                workspace: {
                    enabled: true,
                },
                exportable: true,
                browsable: false,
                style: this.styleService.createStyle({
                    stroke: {
                        color: "blue",
                    },
                    width: 5
                }
                )
            });
            tryBindStoreLayer(this.regionStore, offlineRegionsLayer);
            tryAddLoadingStrategy(this.regionStore, new FeatureStoreLoadingStrategy({
                motion: FeatureMotion.None
            }));
        });
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
