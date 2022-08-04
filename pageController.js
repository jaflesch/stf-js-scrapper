const fs = require('fs');
const pageScraper = require('./pageScraper');
const colors = require('colors');

async function scrapeAll(browserInstance){
	let browser;
	try {
		browser = await browserInstance;
		const scrapedData  = await pageScraper.scraper(browser);	
		await browser.close();
		
		const dir = '.json/';
		if (! fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		
		fs.writeFile(`${dir}/data.json`, JSON.stringify(scrapedData), 'utf8', function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The data has been scrapped and saved successfully! View it at './json/data.json'".green);
		});
		
	} catch(err) {
		console.error("Could not resolve the browser instance => ".red, err);
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
