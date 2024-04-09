import { NewEditionWorkspace } from './new-edition-workspace';

export class RestAPIEdition extends NewEditionWorkspace {
  getUpdateBody(): Object {
    throw new Error('Method not implemented.');
  }
  getCreateBody(): Object {
    throw new Error('Method not implemented.');
  }
}
