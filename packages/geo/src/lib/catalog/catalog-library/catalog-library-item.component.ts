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
  readonly catalog = input.required<Catalog>();

  readonly catalogRemove = output();

  get title(): string {
    return getEntityTitle(this.catalog());
  }

  removeCatalogFromLibrary(event: Event) {
    event.stopPropagation();
    this.catalogRemove.emit();
  }
}
