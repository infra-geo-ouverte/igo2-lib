import { DomUtils } from './dom.utils';

const PATH_PREBUILT_THEMES = 'assets/igo2/core/theming/prebuilt-themes';
const LINK_ID = 'theme-styles';

export function loadTheme(
  doc: Document,
  themeName: string,
  path: string = PATH_PREBUILT_THEMES
): void {
  const src = `${path}/${themeName}.css`;
  const head = doc.getElementsByTagName('head')[0];

  const themeLink = doc.getElementById(LINK_ID) as HTMLLinkElement;
  themeLink ? (themeLink.href = src) : createHtmlLink(doc, src, head);
}

function createHtmlLink(doc: Document, src: string, parent: HTMLElement): void {
  const element = DomUtils.create(doc, 'link', {
    id: LINK_ID,
    rel: 'stylesheet',
    href: src
  });
  parent.appendChild(element);
}
