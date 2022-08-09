const puppeteer = require('puppeteer');
import colors from 'colors';
import { Browser } from 'puppeteer';

type AppCore = Promise<Browser> | null;

export class AppBrowser {
	constructor (
		private core: AppCore = null
	) {}

	async launch (): Promise<void> {
		try {
		  console.log("Launching Chromium browser......".blue);
			var a = await puppeteer.launch({
				headless: false,
					'ignoreHTTPSErrors': true,
				args: ["--disable-setuid-sandbox", "--start-maximized"],
			});
			console.log('@@@@', a);
			this.core = a;
		} catch (err) {
	    console.log(`Could not create browser instance ${err}`);
		}
	}

	async getBrowserInstance (): Promise<Browser | null> {
		console.log('chamou esse cara', this.core);
		return this.core;
	}
}
