import { Injectable, inject } from '@angular/core';

import {
  EntityService,
  EntityTableColumn,
  SelectEntityTableColumn,
  getColumnKeyWithoutPropertiesTag,
  isChoiceField
} from '@igo2/common/entity';

import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { firstValueFrom } from 'rxjs';

import { RelationOptions, SourceFieldsOptionsParams } from '../../datasource';

@Injectable({ providedIn: 'root' })
export class TableDataService {
  private entityService = inject(EntityService);

  async formatData(
    features: OlFeature<OlGeometry>[],
    sourceFields?: SourceFieldsOptionsParams[],
    relations?: RelationOptions[]
  ): Promise<OlFeature<OlGeometry>[]> {
    if (features.length === 0) {
      return [];
    }
    const columns = sourceFields?.length
      ? await this.getSourceColumns(sourceFields, relations)
      : this.getRawColumn(features[0]);

    return this.transformFeaturesToExportFormat(features, columns);
  }

  private async getSourceColumns(
    sourceFields: SourceFieldsOptionsParams[],
    relations?: RelationOptions[]
  ): Promise<EntityTableColumn[]> {
    const sourceFieldsColumns = await this.buildFromFields(sourceFields);
    const relationsColumns = relations
      ? this.buildFromRelations(relations)
      : [];
    return [...sourceFieldsColumns, ...relationsColumns].filter(
      (col) => col.visible !== false
    );
  }

  private getRawColumn(feature: OlFeature<OlGeometry>): EntityTableColumn[] {
    const geometryName = feature.getGeometryName();
    return feature
      .getKeys()
      .filter(
        (key) =>
          !key.startsWith('_') &&
          key !== 'geometry' &&
          key !== geometryName &&
          !/boundedby/gi.test(key)
      )
      .map((key) => ({
        name: key,
        title: key
      }));
  }

  private async buildFromFields(
    fields: SourceFieldsOptionsParams[]
  ): Promise<EntityTableColumn[]> {
    return Promise.all(
      fields.map((field) => this.getColumnFromSourceField(field))
    );
  }

  private async getColumnFromSourceField(
    field: SourceFieldsOptionsParams
  ): Promise<EntityTableColumn> {
    const baseColumn: EntityTableColumn = {
      ...field,
      name: field.name,
      title: field.alias ?? field.name,
      primary: field.primary === true
    };

    if (isChoiceField(field) && !this.isSelectEntityTableColumn(field)) {
      const domainValues = await firstValueFrom(
        this.entityService.getDomainValues(field)
      );
      return { ...baseColumn, domainValues } as SelectEntityTableColumn;
    }
    return baseColumn;
  }

  private buildFromRelations(
    relations: RelationOptions[]
  ): EntityTableColumn[] {
    return relations.map((relation) => ({
      ...relation,
      name: relation.name,
      title: relation.alias ?? relation.name,
      type: 'relation'
    }));
  }

  /**
   * transform feature properties to an export-friendly object using column titles.
   */
  private transformFeaturesToExportFormat(
    features: OlFeature<OlGeometry>[],
    columns: EntityTableColumn[]
  ): OlFeature<OlGeometry>[] {
    return features.map((feature) => {
      const clone = feature.clone();
      return this.transformFeatureProperties(clone, columns);
    });
  }

  private transformFeatureProperties(
    feature: OlFeature<OlGeometry>,
    columns: EntityTableColumn[]
  ): OlFeature<OlGeometry> {
    const exportedValues: Record<string, any> = {};

    for (const column of columns) {
      const key = getColumnKeyWithoutPropertiesTag(column.name);
      const rawValue = feature.get(key);

      exportedValues[column.title] = this.formatValues(
        column,
        rawValue,
        feature
      );
    }

    // Remove all existing properties except geometry and _projection
    // used to export shapefile and GPX
    const projectionKey = '_projection';
    const geometryName = feature.getGeometryName();
    const properties = feature.getProperties() ?? {};
    for (const key of Object.keys(properties)) {
      if (key !== geometryName && key !== projectionKey) {
        feature.unset(key, true);
      }
    }
    // Set new properties
    feature.setProperties(exportedValues, true);

    return feature;
  }

  private formatValues(
    column: EntityTableColumn,
    rawValue: unknown,
    feature: OlFeature<OlGeometry>
  ): string | unknown {
    if (rawValue == null) {
      return column.type === 'relation' ? column?.['icon'] : '';
    }

    if (this.isSelectEntityTableColumn(column)) {
      return this.formatDomainValue(feature, column);
    } else {
      return typeof rawValue === 'object'
        ? JSON.stringify(rawValue)
        : String(rawValue);
    }
  }

  private formatDomainValue(
    feature: OlFeature<OlGeometry>,
    column: SelectEntityTableColumn
  ): unknown {
    const value = this.entityService.resolveDomainValues(
      feature.getProperties(),
      column
    );

    return Array.isArray(value) ? value.join(', ') : value;
  }

  private isSelectEntityTableColumn(
    field: EntityTableColumn | SourceFieldsOptionsParams
  ): field is SelectEntityTableColumn {
    return 'domainValues' in field;
  }
}
