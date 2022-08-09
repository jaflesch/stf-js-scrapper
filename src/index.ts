import { AppBrowser } from './AppBrowser';
import { PageController } from './PageController';

(async function () {
  const app = new AppBrowser();
  await app.launch();
  const browser = app.getBrowserInstance();
  
  const main = new PageController(browser);
  main.execute();
})();
