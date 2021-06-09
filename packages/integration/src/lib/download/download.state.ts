import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TransferedTile } from './TransferedTile';


@Injectable({
   providedIn: 'root'
 })
export class DownloadState {

    readonly addNewTile$: BehaviorSubject<TransferedTile> = new BehaviorSubject(undefined);

    addNewTileToDownload(tile: TransferedTile) {
        if (!tile) {
            return;
        }
        console.log('tile to transfer: ', tile);
        this.addNewTile$.next(tile);
    }
}
