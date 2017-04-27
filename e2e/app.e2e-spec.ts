import { IgoLibPage } from './app.po';

describe('igo-lib App', () => {
  let page: IgoLibPage;

  beforeEach(() => {
    page = new IgoLibPage();
  });

  it('should have a Igo Search Bar', () => {
    page.navigateTo();
    expect(page.getIgoSearchBar().isPresent()).toBeTruthy();
  });

  it('should display title saying Search module', () => {
    page.navigateTo();
    expect(page.getIgoSearchModule().getText()).toEqual('Search module');
  });

});
