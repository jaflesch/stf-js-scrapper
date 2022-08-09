const fs = require('fs');
const colors = require('colors');
import { Browser } from 'puppeteer';
import { PageScraper } from './pageScraper';
import { args } from './args';

export async function scrapeAll(browserInstance: Promise<Browser>){
	let browser;
	try {
		browser = await browserInstance;
		//@ts-ignore
		const pageScraper = new PageScraper(browser, args);
		const scrapedData = await pageScraper.run();	
		await browser.close();
		
		const dir = './json/';
		if (! fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		/*
		// to do: save scrap general data
			- extraction time (start_at, end_at)
			- extraction params
			- total files
			- total pages
			- sizes...
		*/
		
		// Paginated json
		// for (let i = 0; i < scrapedData.length; i++) {
		// 	const folderPath = `${dir}/${i + 1}`;
		// 	if (! fs.existsSync(folderPath)) {
		// 		fs.mkdirSync(folderPath);
		// 	}
			
		// 	const now = new Date();			
		// 	const fileName = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
		// 	fs.writeFile(`${folderPath}/${fileName}.json`, JSON.stringify(scrapedData[i].data), 'utf8', function(err) {
		// 		if(err) {
		// 			return console.log(err);
		// 		}
		// 		console.log("The data has been scrapped and saved successfully! View it at './json/'".green);
		// 	});
		// }
		
		fs.writeFile(`${dir}/data.json`, JSON.stringify(scrapedData), 'utf8', function(err: Error) {
			if(err) {
				return console.log(err);
			}
			console.log("The data has been scrapped and saved successfully! View it at './json/data.json'".green);
		});
		
	} catch(err) {
		console.error("Could not resolve the browser instance => ".red, err);
	}
}

//export const (browserInstance: any) => scrapeAll(browserInstance);

