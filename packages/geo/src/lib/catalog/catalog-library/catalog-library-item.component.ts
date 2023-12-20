import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { getEntityTitle } from '@igo2/common';

import { IgoMap } from '../../map/shared/map';
import { Catalog } from '../shared/catalog.abstract';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';

/**
 * Catalog library item
 */
@Component({
    selector: 'igo-catalog-library-item',
    templateUrl: './catalog-library-item.component.html',
    styleUrls: ['./catalog-library-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatListModule, NgIf, MatIconModule, MatTooltipModule, MatButtonModule, TranslateModule]
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

  @Output() catalogRemove = new EventEmitter();

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.catalog);
  }

  removeCatalogFromLibrary(event) {
    event.stopPropagation();
    this.catalogRemove.emit();
  }
}
