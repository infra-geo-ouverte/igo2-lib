import { TileGenerationStrategy } from './tile-generation-strategy';
import { Tile } from '../../Tile.interface';
import { getParent, getTreeNodes, getNumberOfTreeNodes } from './tile-generation-util';

export class MiddleTileGeneration extends TileGenerationStrategy {
    constructor() {
        super();
    }

    generate(tile: Tile, startLevel: number, endLevel: number): Tile[] {
        const maxDepth = tile.Z - startLevel;
        let highestParent = tile;
        for (let i = 0; i < maxDepth; i++) {
            const parent = getParent(highestParent);
            if (parent) {
                highestParent = getParent(highestParent);
            } else {
                break;
            }
        }
        return getTreeNodes(highestParent, endLevel);
    }

    getNumberOfTiles(tile: Tile, startLevel: number, endLevel: number): number {
        const maxDepth = endLevel - startLevel;
        let highestParent = tile;
        for (let i = 0; i < maxDepth; i++) {
            const parent = getParent(highestParent);
            if (parent) {
                highestParent = getParent(highestParent);
            } else {
                break;
            }
        }
        const depth = endLevel - highestParent.Z;
        return getNumberOfTreeNodes(depth);
    }
}
