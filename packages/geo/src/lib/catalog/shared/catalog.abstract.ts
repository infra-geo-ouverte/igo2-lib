
import { ICatalog, ICompositeCatalog , CatalogItem, CatalogItemGroup } from './catalog.interface';
import { CatalogService } from './catalog.service';
import { TooltipType } from '../../layer';
import { TimeFilterOptions } from '../../filter';
import { QueryFormat, QueryHtmlTarget  } from '../../query';
import { Observable } from 'rxjs';

// import { EntityState } from '@igo2/common';
// import { MetadataLayerOptions } from './../../metadata/shared/metadata.interface';
import { TypeCatalog, TypeCatalogStrings } from './catalog.enum';

export abstract class Catalog implements ICatalog {

    // ICatalog -----------------------------
    id: string;
    title: string;
    url: string;
    items?: CatalogItem[];
    type?: TypeCatalogStrings;
    version?: string;
    matrixSet?: string;
    requestEncoding?: string;
    regFilters?: string[];
    groupImpose?: CatalogItemGroup;
    timeFilter?: TimeFilterOptions;
    queryFormat?: QueryFormat;
    queryHtmlTarget?: QueryHtmlTarget;
    queryParams?: { [key: string]: string; };
    sourceOptions?: { [key: string]: any; };
    count?: number;
    tooltipType?: TooltipType.ABSTRACT | TooltipType.TITLE;
    sortDirection?: 'asc' | 'desc';
    setCrossOriginAnonymous?: boolean;
    // ICatalog -----------------------------

    // layerslist?: string[];
    catalogService: CatalogService;

    constructor(options: Catalog, service: CatalogService) {
        Object.assign(this, options);
        this.catalogService = service;
    }

    public isComposite(): boolean {
        return false;
    }

    public abstract operation(): string;

    public abstract collectCatalogItems(): Observable<CatalogItem[]>;
}

class WMSCatalog extends Catalog {
    constructor(options: Catalog, service: CatalogService) {
        super(options, service);
        const sType: string = TypeCatalog[TypeCatalog.wms];
        this.type =  TypeCatalog[sType];
    }

    public operation(): string {
        return 'wmsCatalog';
    }

    public collectCatalogItems(): Observable<CatalogItem[]> {
        return this.catalogService.loadCatalogWMSLayerItems(this);
    }
}

class WMTSCatalog extends Catalog {
    constructor(options: Catalog, service: CatalogService) {
        super(options, service);
        const sType: string = TypeCatalog[TypeCatalog.wmts];
        this.type =  TypeCatalog[sType];
    }

    public operation(): string {
        return 'wmtsCatalog';
    }

    public collectCatalogItems(): Observable<CatalogItem[]> {
        return this.catalogService.loadCatalogWMTSLayerItems(this);
    }
}

class BaselayersCatalog extends Catalog {
    constructor(options: Catalog, service: CatalogService) {
        super(options, service);
        const sType: string = TypeCatalog[TypeCatalog.baselayers];
        this.type =  TypeCatalog[sType];
    }

    public operation(): string {
        return 'baselayersCatalog';
    }

    public collectCatalogItems(): Observable<CatalogItemGroup[]> {
        return this.catalogService.loadCatalogBaseLayerItems(this);
    }
}

export class CompositeCatalog extends Catalog implements ICompositeCatalog {
    // url = null;
    composite: Catalog[];

    constructor(options: Catalog, service: CatalogService) {
        super(options, service);
        const sType: string = TypeCatalog[TypeCatalog.composite];
        this.type =  TypeCatalog[sType];
        this.url = null;
    }

    public add(component: Catalog): void {
        this.composite.push(component);
    }

    public isComposite(): boolean {
        return true;
    }

    public trace() {
        console.log('compositeCatalog Trace: ' + this.type);
    }

    public operation(): string {
        const results = [];
        for (const child of this.composite) {
            results.push(child.operation());
        }

        return `Branch(${results.join('+')})`;
    }

    public collectCatalogItems(): Observable<CatalogItem[]> {
        // throw new Error('Method not implemented.');
        return this.catalogService.loadCatalogCompositeLayerItems(this);
    }
}

export class CatalogFactory {

    public static createInstanceCatalog(options: Catalog, service: CatalogService): Catalog {

        let catalog: Catalog;
        if (options.hasOwnProperty('composite')) {
            catalog = new CompositeCatalog(options, service);
        } else if (options.type === TypeCatalog[TypeCatalog.baselayers]) {
            catalog = new BaselayersCatalog(options, service);
        } else if (options.type === TypeCatalog[TypeCatalog.wmts]) {
            catalog = new WMTSCatalog(options, service);
        } else {
            catalog = new WMSCatalog(options, service);
        }

        // console.log(options instanceof Catalog);
        // console.log(options instanceof CompositeCatalog);
        // console.log(newCatalog instanceof Catalog);
        // console.log(newCatalog instanceof CompositeCatalog);
        // (newCatalog as CompositeCatalog).trace();

        return catalog;
    }
}
