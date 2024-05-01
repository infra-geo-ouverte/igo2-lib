import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { getEntityTitle } from '@igo2/common';
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
  standalone: true,
  imports: [
    MatListModule,
    NgIf,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    IgoLanguageModule
  ]
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
