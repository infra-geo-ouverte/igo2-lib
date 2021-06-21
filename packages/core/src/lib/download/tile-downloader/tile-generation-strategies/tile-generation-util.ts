import { Tile } from '../../Tile.interface';

export function zoom(tile: Tile): Tile[] {
    const x0 = 2 * tile.X;
    const y0 = 2 * tile.Y;
    const z = tile.Z + 1;
    const tiles: Tile[] = [];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            tiles.push({X: x0 + i, Y: y0 + j, Z: z} as Tile);
        }
    }
    return tiles;
}

export function deZoom(tile: Tile): Tile {
  if (tile.Z === 0) { 
    return;
  }
  
  const X = Math.floor(tile.X / 2);
  const Y = Math.floor(tile.Y / 2);
  const Z = tile.Z - 1;

  return { X, Y, Z };
}
  
export function getTreeNodes(root: Tile, maxLevel: number) {
  if (root.Z === maxLevel) {
    return [root];
  }

  const children = zoom(root);
  let nextChildren: Tile[] = [];
  children.forEach((child) => {
    nextChildren = nextChildren.concat(getTreeNodes(child, maxLevel));
  });
  return [root].concat(nextChildren);
}

export function getParent(tile: Tile): Tile {
  return deZoom(tile);
}

export function getNumberOfTreeNodes(deltaHeigth: number) {
  return (Math.pow(4, deltaHeigth + 1) - 1) / 3;
}