import { TileGenerationStrategies } from "./tile-generation-strategy.interface";

export interface TileGenerationParams {
    genMethod: TileGenerationStrategies,
    startLevel: number,
    parentLevel: number,
    endLevel: number
}
