import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoDataDBService } from '@igo2/core';
import { first } from 'rxjs/operators';
import { createFromTemplate } from 'ol/tileurlfunction.js'
import { forkJoin } from 'rxjs';

interface Tile {
  X: number;
  Y: number;
  Z: number;
}

function zoom(tile: Tile): Tile[] {
  const x0 = 2*tile.X;
  const y0 = 2*tile.Y;
  const z = tile.Z + 1;
  const tiles:Tile[] = []; 
  for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
          tiles.push({X: x0 + i, Y: y0 + j, Z: z} as Tile);
      }
  }
  return tiles
}

function getTreeNodes(root: Tile, maxDepth: number) {
  if (root.Z === maxDepth) {
    return [root];
  }

  const children = zoom(root);
  let nextChildren: Tile[] = [];
  children.forEach((child) => {
    nextChildren = nextChildren.concat(getTreeNodes(child, maxDepth));
  });
  return [root].concat(nextChildren);
}

function getNumberOfTreeNodes(tile: Tile, maxDepth: number) {
  const h = maxDepth - tile.Z;
  return (Math.pow(4, h + 1) - 1)/3
}

@Injectable({
  providedIn: 'root'
})
export class TileDownloaderService {
  readonly maxDepth: number = 10;
  public urlGenerator: (coord: [number, number, number], 
                        pixelRatio, projection) => string;

  constructor(
    private http: HttpClient,
    private geoDB: GeoDataDBService) { }
  
  private generateTiles(tile: Tile): Tile[] {
    const a = function(a:string) {
      return a;
    }
    return getTreeNodes(tile, this.maxDepth);
  }

  private generateTilesRegion(region: Tile[]) {
    let tiles = [];
    region.forEach((tile) => {
      tiles = tiles.concat(this.generateTiles(tile));
    })
    return tiles;
  }
  
  private initURLGenerator(tileGrid, url) {
    this.urlGenerator = createFromTemplate(url, tileGrid);
  }

  private generateURL(tile: Tile) {
    return this.urlGenerator([tile.Z, tile.X, tile.Y], 0, 0);
  }

  public downloadRegion(region: Tile[], domain: string) {
    if (window.navigator.onLine) {
      const tiles = this.generateTilesRegion(region);
      const urls = []
      tiles.forEach((tile) => {
        urls.push(this.generateURL(tile))
      });
      
      urls.forEach((url)=> {
        this.http.get(url , { responseType: 'blob' })
          .pipe(first())
          .subscribe((blob) => {
            if (blob) {
              this.geoDB.update(url, blob);
            }
          });
      });
    }
  }
  
  public downloadFromCoord(coord3D: [number, number, number], tileGrid, url) {
    this.initURLGenerator(tileGrid, url);
    const rootTile: Tile = {X: coord3D[1], Y: coord3D[2], Z: coord3D[0]};
    const tiles = this.generateTiles(rootTile);
    const urls = tiles.map((tile) => {
      return this.generateURL(tile);
    });

    console.log(urls);
    const requests = urls.map((url) => {
      return this.http.get(url, { responseType: 'blob' });
    });

    const downloads = requests.map((request, i) => {
        return request.pipe(first()).subscribe((blob) => {
          this.geoDB.update(urls[i], blob);
        });
    })

    forkJoin(requests).pipe(first()).subscribe(request => console.log("downloading done"));
  }
}
