import { SourceFieldsOptionsParams } from '../../datasource';
import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';

export class RestAPIEdition extends NewEditionWorkspace {
  private get dataSourceOptions() {
    return this.layer.dataSource.options;
  }

  getUpdateBody(feature: EditionFeature): Object {
    const {
      params: { fieldNameGeometry }
    } = this.dataSourceOptions;

    const fieldsToRemove: string[] = this.getPropertyKeys(
      (sourceField) => sourceField.validation?.readonly
    );

    fieldsToRemove.push(fieldNameGeometry, 'boundedBy');

    return this.removeProperties(feature, fieldsToRemove);
  }

  getCreateBody(feature: EditionFeature): Object {
    // TODO support geometry
    const fieldsToRemove = this.getPropertyKeys(
      (sourceField) => sourceField.validation?.readonly && sourceField.primary
    );
    return this.removeProperties(feature, fieldsToRemove);
  }

  private getPropertyKeys(
    predicate: (sourceField: SourceFieldsOptionsParams) => boolean
  ) {
    const { sourceFields } = this.dataSourceOptions;
    return sourceFields
      .filter(predicate)
      .map((sourceField) => sourceField.name);
  }

  private removeProperties(feature: EditionFeature, fieldsToRemove: string[]) {
    const properties = { ...feature.properties };
    for (const field of fieldsToRemove) {
      delete properties[field];
    }
    return properties;
  }
}
