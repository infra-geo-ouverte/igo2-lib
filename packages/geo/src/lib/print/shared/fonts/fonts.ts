import { openSansFonts } from './open-sans';
import { robotoFonts } from './roboto';
import { sourceSansFonts } from './source-sans';

export default function jsPdfFonts(jsPDFAPI) {
  sourceSansFonts(jsPDFAPI);
  robotoFonts(jsPDFAPI);
  openSansFonts(jsPDFAPI);
}
