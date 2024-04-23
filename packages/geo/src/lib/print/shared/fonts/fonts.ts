import { openSansFonts } from './open-sans';
import { robotoFonts } from './roboto';

export default function jsPdfFonts(jsPDFAPI) {
  robotoFonts(jsPDFAPI);
  openSansFonts(jsPDFAPI);
}
