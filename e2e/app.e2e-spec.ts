import { ThreeCPage } from './app.po';

describe('three-c App', () => {
  let page: ThreeCPage;

  beforeEach(() => {
    page = new ThreeCPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
