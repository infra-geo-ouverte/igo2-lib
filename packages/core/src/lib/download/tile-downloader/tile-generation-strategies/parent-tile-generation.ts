import { Tile } from '../../Tile.interface';
import { TileGenerationStrategy } from './tile-generation-strategy';
import { getNumberOfTreeNodes, getTreeNodes } from './tile-generation.utils';

export class ParentTileGeneration extends TileGenerationStrategy {
    constructor() {
        super();
    }

    generate(tile: Tile, startLevel: number, endLevel: number): Tile[] {
        return getTreeNodes(tile, endLevel);
    }

    getNumberOfTiles(tile: Tile, startLevel: number, endLevel: number): number {
        const depth = endLevel - startLevel;
        return getNumberOfTreeNodes(depth);
    }
}
