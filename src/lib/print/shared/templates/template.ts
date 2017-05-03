import { PrintOptions } from '../print.interface';
import { PrintFormat, PrintOrientation,
         PrintResolution } from '../print.type';

declare var jsPDF: any;

export abstract class Template {

  protected doc: any;

  get format(): PrintFormat {
    return this.options.format;
  }

  get orientation(): PrintOrientation {
    return this.options.orientation;
  }

  get resolution(): PrintResolution {
    return this.options.resolution;
  }

  constructor(private options: PrintOptions) {
    this.doc = new jsPDF(this.orientation, undefined, this.format);
  }

  abstract setHeader(header: any);

  abstract setBody(body: any);

  abstract setFooter(header: any);

}
