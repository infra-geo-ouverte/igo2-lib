import { browser, element, by } from 'protractor';

export class IgoLibPage {
  navigateTo() {
    return browser.get('/');
  }

  getIgoSearchBar() {
    return element(by.css('igo-demo igo-search-bar'));
  }

  getIgoSearchModule() {
    return element.all(by.css('igo-demo md-card-subtitle')).get(1);
  }
}
