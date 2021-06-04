import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoDataDBService, GeoNetworkService } from '@igo2/core';
import { first } from 'rxjs/operators';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { forkJoin, Observable, Observer } from 'rxjs';
import { CompressedData } from '@igo2/core/lib/storage/compressedData.interface';

interface Tile {
  X: number;
  Y: number;
  Z: number;
}

function zoom(tile: Tile): Tile[] {
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
  return (Math.pow(4, h + 1) - 1) / 3;
}

@Injectable({
  providedIn: 'root'
})
export class TileDownloaderService {
  readonly maxHeigthDelta: number = 4;
  readonly simultaneousRequests: number = 20;

  private urlQueue: string[] = [];
  private isDownloading: boolean = false;

  public urlGenerator: (coord: [number, number, number],
                        pixelRatio, projection) => string;
  
  
  constructor(
    private http: HttpClient,
    private network: GeoNetworkService,
    private geoDB: GeoDataDBService) { }

  private generateTiles(tile: Tile): Tile[] {
    return getTreeNodes(tile, tile.Z + this.maxHeigthDelta);
  }

  private generateTilesRegion(region: Tile[]) {
    let tiles = [];
    region.forEach((tile) => {
      tiles = tiles.concat(this.generateTiles(tile));
    });
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
      const urls = tiles.map((tile) => {
        return this.generateURL(tile);
      });

      urls.forEach((url) => {
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

  public downloadFromCoord(coord3D: [number, number, number], tileGrid, src) {
    if (!this.network.isOnline()) {
      return;
    }

    this.initURLGenerator(tileGrid, src);
    const rootTile: Tile = {X: coord3D[1], Y: coord3D[2], Z: coord3D[0]};
    const tiles = this.generateTiles(rootTile);
    
    tiles.forEach((tile) => {
      const url = this.generateURL(tile);
      this.urlQueue.push(url)
    });

    console.log("Queue :", this.urlQueue.length);
    // if not already downloading start downloading
    if (!this.isDownloading) {
      // put count here
      console.log('starting download sequence!');
      this.isDownloading = true;
      this.downloadSequence();
    }
  }

  private downloadSequence() {
    const downloadTile = (url: string) => {
      return (observer: Observer<any>) => {
        const request = this.http.get(url, { responseType: 'blob' });
        request.subscribe((blob) => {
          this.geoDB.update(url, blob).subscribe(() => {
            observer.next('done downloading ' + url);
            observer.complete();
          });
        });
      }
    }

    const nextDownload = () => {
      const url =  this.urlQueue.shift();
      if (!url) {
        this.isDownloading = false;
        console.log("downloading is done");
        return;
      }
      const request = new Observable(downloadTile(url));
      request.subscribe(() => nextDownload())
    }
    
    for (let i = 0; i < this.simultaneousRequests; i++) {
      nextDownload();
    }
  }
}
