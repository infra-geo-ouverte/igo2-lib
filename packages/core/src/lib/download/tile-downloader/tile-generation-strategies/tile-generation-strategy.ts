import { Tile } from '../../Tile.interface';

export abstract class TileGenerationStrategy {
    constructor() {}

    abstract generate(tile: Tile, startLevel: number, endLevel: number): Tile[];
    abstract getNumberOfTiles(tile: Tile, startLevel: number, endLevel: number)
        : number;
}
