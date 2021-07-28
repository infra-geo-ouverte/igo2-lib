import { ChildTileGeneration } from './child-tile-generation';
import { MiddleTileGeneration } from './middle-tile-generation';
import { ParentTileGeneration } from './parent-tile-generation';
import { TileGenerationStrategy } from './tile-generation-strategy';
import { TileGenerationStrategies } from './tile-generation-strategy.interface';


export function newTileGenerationStrategy(
    strategy: string
  ): TileGenerationStrategy {
    switch (strategy) {
      case TileGenerationStrategies.CHILD:
        return new ChildTileGeneration();
      case TileGenerationStrategies.MIDDLE:
        return new MiddleTileGeneration();
      case TileGenerationStrategies.PARENT:
        return new ParentTileGeneration();
      default:
        throw new Error('Invalid Tile Generation Strategy');
    }
}
