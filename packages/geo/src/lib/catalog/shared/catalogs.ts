import { Observable } from 'rxjs';
import { Catalog, CollectCatalogItemsFn } from './catalog.abstract';
import { TypeCatalog } from './catalog.enum';
import {
  CatalogItem,
  CatalogItemGroup,
  ICatalog,
  ICompositeCatalog
} from './catalog.interface';

export class WMSCatalog extends Catalog {
  constructor(options: Catalog, private _collectCatlogItems: CollectCatalogItemsFn) {
    super(options);
    const sType: string = TypeCatalog[TypeCatalog.wms];
    this.type = TypeCatalog[sType];
  }

  public collectCatalogItems(): Observable<CatalogItem[]> {
    return this._collectCatlogItems(this);
  }
}

export class WMTSCatalog extends Catalog {
  constructor(options: Catalog, private _collectCatlogItems: CollectCatalogItemsFn) {
    super(options);
    const sType: string = TypeCatalog[TypeCatalog.wmts];
    this.type = TypeCatalog[sType];
  }

  public collectCatalogItems(): Observable<CatalogItem[]> {
    return this._collectCatlogItems(this);
  }
}

export class BaselayersCatalog extends Catalog {
  constructor(options: Catalog, private _collectCatlogItems: CollectCatalogItemsFn) {
    super(options);
    const sType: string = TypeCatalog[TypeCatalog.baselayers];
    this.type = TypeCatalog[sType];
  }

  public collectCatalogItems(): Observable<CatalogItemGroup[]> {
    return this._collectCatlogItems(this);
  }
}

export class ArcGISRestCatalog extends Catalog {
  constructor(options: Catalog, private _collectCatlogItems: CollectCatalogItemsFn) {
    super(options);
    const sType: string = TypeCatalog[TypeCatalog.arcgisrest];
    this.type = TypeCatalog[sType];
  }

  public collectCatalogItems() {
    return this._collectCatlogItems(this);
  }
}

export class TileOrImageArcGISRestCatalog extends Catalog {
  constructor(
    options: Catalog,
    public _collectCatlogItems: CollectCatalogItemsFn,
    typeCatalog: TypeCatalog
  ) {
    super(options);
    this.type = TypeCatalog[TypeCatalog[typeCatalog]];
  }

  public collectCatalogItems() {
    return this._collectCatlogItems(this);
  }
}

export class CompositeCatalog extends Catalog implements ICompositeCatalog {
  composite: ICatalog[];

  constructor(options: Catalog, private _collectCatlogItems: CollectCatalogItemsFn) {
    super(options);
    const sType: string = TypeCatalog[TypeCatalog.composite];
    this.type = TypeCatalog[sType];
    this.url = null;
  }

  public collectCatalogItems(): Observable<CatalogItem[]> {
    return this._collectCatlogItems(this);
  }
}
