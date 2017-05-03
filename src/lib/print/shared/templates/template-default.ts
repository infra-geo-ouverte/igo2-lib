import { Template } from './template';

export abstract class DefaultTemplate extends Template {

  setHeader(header: string) {
    this.doc.setFontSize(40);
    this.doc.text(35, 25, header);
  }

}
