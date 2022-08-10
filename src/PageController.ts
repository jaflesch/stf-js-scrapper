const fs = require('fs');
const colors = require('colors');
import { Browser } from 'puppeteer';
import { PageScraper } from './PageScraper';
import { args } from './args';
import { FileController } from './FileController';

export class PageController {
	constructor(
		private readonly browserInstance: Promise<Browser | null>
	){}

	async execute ()  {
		try {
			const browser = await this.browserInstance;
			if(! browser) {
				throw `Chromium browser launching failed`.red;
			}
			const pageScraper = new PageScraper(browser, args);
			const scrapedData = await pageScraper.run();	
			const fileController = new FileController(scrapedData, args);
			fileController.save();
			
			await browser.close();
		} 
		catch (err) {
			console.error(`Fatal error on execution: ${err}`.red);
		}
	}
}
