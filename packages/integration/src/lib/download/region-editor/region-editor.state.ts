import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TileGenerationStrategies, TileToDownload } from '@igo2/core';
import { TileGenerationParams } from '@igo2/core/lib/download/tile-downloader/tile-generation-strategies/tile-generation-params.interface';
import { Feature } from '@igo2/geo';
import { Observable } from 'rxjs';
import { MapState } from '../../map';
import { CreationEditionStrategy } from './editing-strategy/creation-editing-strategy';
import { EditionStrategy } from './editing-strategy/edition-strategy';

export interface EditedRegion {
    name: string;
    urls: Set<string>;
    parentUrls: Array<string>;
    tiles: TileToDownload[];
    tileGrid: any;
    templateUrl: string;
    genParams: TileGenerationParams;
    features: Feature[];
}

function newEditedRegion(): EditedRegion {
    return {
        name: undefined,
        urls: new Set(),
        parentUrls: new Array(),
        tiles: new Array(),
        tileGrid: undefined,
        templateUrl: undefined,
        genParams: {
            startLevel: undefined,
            parentLevel: undefined,
            endLevel: undefined,
            genMethod: TileGenerationStrategies.PARENT
        },
        features: new Array()
    };
}

@Injectable({
   providedIn: 'root'
 })
export class RegionEditorState {
    private _editedRegion: EditedRegion = newEditedRegion();
    private _editionStrategy: EditionStrategy = new CreationEditionStrategy();

    progression$: Observable<number>;
    isDownloading: boolean;
    drawnRegionGeometryForm: FormControl = new FormControl();

    constructor(private mapState: MapState) {}

    get map() {
        return this.mapState.map;
    }

    set editedRegion(editedRegion: EditedRegion) {
        if (!editedRegion) {
            this._editedRegion = newEditedRegion();
            return;
        }
        this._editedRegion = editedRegion;
    }

    get editedRegion(): EditedRegion {
        return this._editedRegion;
    }

    set regionName(name: string) {
        this._editedRegion.name = name;
    }

    get regionName(): string {
        return this._editedRegion.name;
    }

    set urlsToDownload(urls: Set<string>) {
        this._editedRegion.urls = urls;
    }

    get urlsToDownload(): Set<string> {
        return this._editedRegion.urls;
    }

    set parentTileUrls(value: Array<string>) {
        this._editedRegion.parentUrls = value;
    }

    get parentTileUrls(): Array<string> {
        return this._editedRegion.parentUrls;
    }

    set tilesToDownload(tiles: TileToDownload[]) {
        this._editedRegion.tiles = tiles;
    }

    get tilesToDownload(): TileToDownload[] {
        return this._editedRegion.tiles;
    }

    set parentLevel(level: number) {
        this._editedRegion.genParams.parentLevel = level;
    }

    get parentLevel(): number {
        return this._editedRegion.genParams.parentLevel;
    }

    set genParams(params: TileGenerationParams) {
        this._editedRegion.genParams = params;
    }

    get genParams(): TileGenerationParams {
        return this._editedRegion.genParams;
    }

    set editedTilesFeatures(features: Feature[]) {
        this._editedRegion.features = features;
    }

    get editedTilesFeatures(): Feature[] {
        return this._editedRegion.features;
    }

    set editionStrategy(strategy: EditionStrategy) {
        this._editionStrategy = strategy;
    }

    get editionStrategy(): EditionStrategy {
        return this._editionStrategy;
    }
}
