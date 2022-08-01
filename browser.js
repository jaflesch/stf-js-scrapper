const puppeteer = require('puppeteer');

async function startBrowser() {
	let browser;
	try {
	    console.log("Opening the browser......");
	    browser = await puppeteer.launch({
	        headless: false,
            'ignoreHTTPSErrors': true,
	        args: ["--disable-setuid-sandbox", "--start-maximized"],
	    });
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
	}
	return browser;
}

module.exports = {
	startBrowser
};
