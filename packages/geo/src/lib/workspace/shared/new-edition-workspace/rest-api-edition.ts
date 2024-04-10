import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';

export class RestAPIEdition extends NewEditionWorkspace {
  getUpdateBody(feature: EditionFeature): Object {
    // TODO refactor
    for (const property in feature.properties) {
      if (!this.layer.dataSource.options.sourceFields) {
        if (property === 'boundedBy' || property === 'msGeometry') {
          delete feature.properties[property];
        }
        continue;
      }

      console.log();
      for (const sf of this.layer.dataSource.options.sourceFields) {
        if (
          property === 'msGeometry' ||
          (sf.name === property && sf.validation?.readonly) ||
          (sf.name === property && sf.validation?.send === false) ||
          property === 'boundedBy'
        ) {
          delete feature.properties[property];
        }
      }
    }
    return feature.properties;
  }
  getCreateBody(): Object {
    throw new Error('Method not implemented.');
  }
}
