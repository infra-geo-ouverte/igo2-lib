import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';

export class RestAPIEdition extends NewEditionWorkspace {
  getUpdateBody(feature: EditionFeature): Object {
    const dataSourceOptions = this.layer.dataSource.options;
    const {
      params: { fieldNameGeometry },
      sourceFields
    } = dataSourceOptions;

    const fieldsToRemove = sourceFields
      .filter((sourceField) => sourceField.validation)
      .map((sourceField) => sourceField.name);

    fieldsToRemove.push(fieldNameGeometry, 'boundedBy');

    const properties = { ...feature.properties };
    for (const field of fieldsToRemove) {
      delete properties[field];
    }
    return properties;
  }
  getCreateBody(): Object {
    throw new Error('Method not implemented.');
  }
}
