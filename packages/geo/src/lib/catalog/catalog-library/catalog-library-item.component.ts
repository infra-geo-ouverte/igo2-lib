import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { getEntityTitle } from '@igo2/common/entity';
import { IgoLanguageModule } from '@igo2/core/language';

import { IgoMap } from '../../map/shared/map';
import { Catalog } from '../shared/catalog.abstract';

/**
 * Catalog library item
 */
@Component({
  selector: 'igo-catalog-library-item',
  templateUrl: './catalog-library-item.component.html',
  styleUrls: ['./catalog-library-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class CatalogLibraryItemComponent {
  /**
   * Catalog
   */
  readonly catalog = input<Catalog>(undefined);

  /**
   * Map to add the catalog items to
   */
  readonly map = input<IgoMap>(undefined);

  readonly catalogRemove = output();

  get title(): string {
    return getEntityTitle(this.catalog());
  }

  removeCatalogFromLibrary(event) {
    event.stopPropagation();
    this.catalogRemove.emit();
  }
}
