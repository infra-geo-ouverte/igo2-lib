import { IgoLibPage } from './app.po';

describe('igo-lib App', () => {
  let page: IgoLibPage;

  beforeEach(() => {
    page = new IgoLibPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('demo works!');
  });
});
