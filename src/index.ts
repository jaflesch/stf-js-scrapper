import { startBrowser } from './browser';
import { scrapeAll } from './pageController';

let browserInstance = startBrowser();
scrapeAll(browserInstance);
