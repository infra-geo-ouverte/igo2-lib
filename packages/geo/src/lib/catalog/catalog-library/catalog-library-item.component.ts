import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { getEntityTitle } from '@igo2/common';
import { IgoMap } from '../../map';
import { Catalog } from '../shared/catalog.abstract';

/**
 * Catalog library item
 */
@Component({
  selector: 'igo-catalog-library-item',
  templateUrl: './catalog-library-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLibaryItemComponent {

  /**
   * Catalog
   */
  @Input() catalog: Catalog;

  /**
   * Map to add the catalog items to
   */
  @Input() map: IgoMap;

  /**
   * @internal
   */
  get title(): string { return getEntityTitle(this.catalog); }

}
