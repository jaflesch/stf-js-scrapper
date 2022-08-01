const browserObject = require('./browser');
const scraperController = require('./pageController');

let browserInstance = browserObject.startBrowser();
scraperController(browserInstance);
