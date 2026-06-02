import { Observable } from 'rxjs';

import { Catalog, CollectCatalogItemsFn } from './catalog.abstract';
import { TypeCatalog, TypeCatalogStrings } from './catalog.enum';
import {
  CatalogItem,
  CatalogItemGroup,
  ICatalog,
  ICompositeCatalog
} from './catalog.interface';

export class WMSCatalog extends Catalog {
  constructor(
    options: ICatalog,
    private _collectCatlogItems: CollectCatalogItemsFn
  ) {
    super(options);
    this.type = TypeCatalog[TypeCatalog.wms] as TypeCatalogStrings;
  }

  public collectCatalogItems(): Observable<CatalogItem[]> {
    return this._collectCatlogItems(this);
  }
}

export class WMTSCatalog extends Catalog {
  constructor(
    options: ICatalog,
    private _collectCatlogItems: CollectCatalogItemsFn
  ) {
    super(options);
    this.type = TypeCatalog[TypeCatalog.wmts] as TypeCatalogStrings;
  }

  public collectCatalogItems(): Observable<CatalogItem[]> {
    return this._collectCatlogItems(this);
  }
}

export class BaselayersCatalog extends Catalog {
  constructor(
    options: ICatalog,
    private _collectCatlogItems: CollectCatalogItemsFn
  ) {
    super(options);
    this.type = TypeCatalog[TypeCatalog.baselayers] as TypeCatalogStrings;
  }

  public collectCatalogItems(): Observable<CatalogItemGroup[]> {
    return this._collectCatlogItems(this);
  }
}

export class ArcGISRestCatalog extends Catalog {
  constructor(
    options: ICatalog,
    private _collectCatlogItems: CollectCatalogItemsFn
  ) {
    super(options);
    this.type = TypeCatalog[TypeCatalog.arcgisrest] as TypeCatalogStrings;
  }

  public collectCatalogItems() {
    return this._collectCatlogItems(this);
  }
}

export class TileOrImageArcGISRestCatalog extends Catalog {
  constructor(
    options: ICatalog,
    public _collectCatlogItems: CollectCatalogItemsFn,
    typeCatalog: TypeCatalog
  ) {
    super(options);
    this.type = TypeCatalog[typeCatalog] as TypeCatalogStrings;
  }

  public collectCatalogItems() {
    return this._collectCatlogItems(this);
  }
}

export class CompositeCatalog extends Catalog implements ICompositeCatalog {
  declare composite: ICatalog[];

  constructor(
    options: ICompositeCatalog,
    private _collectCatlogItems: CollectCatalogItemsFn
  ) {
    super(options);
    this.type = TypeCatalog[TypeCatalog.composite] as TypeCatalogStrings;
    this.url = '';
  }

  public collectCatalogItems(): Observable<CatalogItem[]> {
    return this._collectCatlogItems(this);
  }
}
