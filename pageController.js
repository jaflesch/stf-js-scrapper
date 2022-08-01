const fs = require('fs');
const pageScraper = require('./pageScraper');

async function scrapeAll(browserInstance){
	let browser;
	try {
		browser = await browserInstance;
		const scrapedData  = await pageScraper.scraper(browser);	
		await browser.close();
		fs.writeFile("json/data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The data has been scrapped and saved successfully! View it at './json/data.json'");
		});
		
	} catch(err) {
		console.error("Could not resolve the browser instance => ", err);
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
