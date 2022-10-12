const colors = require('colors');
import { Browser, Page } from 'puppeteer';
import { utils } from './utils';
import { CLIArgs } from './args';
import { isValid } from 'date-fns';

export type JudgmentScrap = {
	id: string;
	docId: string | null;
	innerHTML: string | undefined;
	innerPageHTML: string | undefined;
	pdfFileUrl: string | null;
	innerPageUrl: string;
}

export type ScrapedData = Array<{
	page: number;
	data: JudgmentScrap[];
	startAt: number;
	endAt: number;
	options: CLIArgs;
}>

export class PageScraper {
	private offset: number;
	private limit: number;
	private rowsPerPage: number;
	private debug: boolean;
	private page: number;
	private order: string;
	private orderBy: string;
	private dateInterval: string;
	private url = '';
	private mainFrameDOM = '.result-container.jud-text.p-15.ng-star-inserted';

	constructor (
		private readonly browserInstace: Browser, 
		private readonly _options: CLIArgs
	) {
		this.browserInstace = browserInstace;
		this.page = _options.offset + 1;
		this.limit = _options.limit;
		this.offset = _options.offset;
		this.rowsPerPage = _options.rows;
		this.debug = _options.debug;
		
		const { order, orderBy } = this.parseSort(_options.s);
		this.order = order;
		this.orderBy = orderBy;

		this.validateDateInterval(_options.dateInterval);
		this.dateInterval = _options.dateInterval;
		
		this.parseURLParams();
	}

	private parseSort (sortArgString: any) {
		const [order, orderBy] = sortArgString.split(',');

		return {
			order: (order === "score") ? "_score" : "date",
			orderBy: (orderBy === "desc") ? "desc" : "asc",
		}
	}

	private validateDateInterval(dateInterval: string) {
		if (dateInterval === '') {
			return;
		} else if (
			dateInterval.length < 17 ||
			dateInterval.match(/^[0-9]{8}-[0-9]{8}$/) === null
		) {
			throw new Error('Invalid date format'.red);
		} else {
			const startDate = new Date(
				`${dateInterval.substring(0, 2)}-${dateInterval.substring(2, 4)}-${dateInterval.substring(4, 8)}`
			);
			const endDate = new Date(
				`${dateInterval.substring(9, 11)}-${dateInterval.substring(11, 13)}-${dateInterval.substring(13, 17)}`
			);

			if (! isValid(startDate)) {
				throw new Error('Invalid interval start date'.red);
			}
			if (! isValid(endDate)) {
				throw new Error('Invalid interval end date'.red);
			}			
		}
	}

	private parseURLParams () {
		let baseUrl = 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&sinonimo=true&plural=true&queryString=a';
		//baseUrl += '&julgamento_data=01062020-01062021';
		baseUrl += `&page=${this.page}`;
		baseUrl += `&pageSize=${this.rowsPerPage}`;
		baseUrl += `&sort=${this.order}`;
		baseUrl += `&sortBy=${this.orderBy}`;
		
		if (this.dateInterval) {
			baseUrl += `&julgamento_data=${this.dateInterval}`;
		}

		this.url = baseUrl;
	}

	private getUrl () {
		return this.url;
	}

	private nextPage () {
		this.page++;
		this.parseURLParams();
	}

	private previousPage () {
		this.page = Math.max(1, this.page - 1);
		this.parseURLParams();
	}

	private async execute () {
		let results: ScrapedData = [];
		try {
			
			this.debug && console.warn(`Starting process`.blue);
			const page = await this.browserInstace.newPage();
			await page.goto(this.url);
			await page.waitForSelector(this.mainFrameDOM);		
			this.debug && console.warn('DOM Tree loaded...'.blue);
	
			let totalPages = this.limit;
			if (totalPages < 1) {
				totalPages = Number(await page.$eval('paginator .pages-resume', (text: any) => 
					text.innerText.replace(/[^0-9]+/g, '')
				));
			} 
			totalPages += this.offset;
			
			this.debug && console.warn(`${this.limit} pages to scrap data [${this.page}-${totalPages}]...`.blue);
	
			for(let index = this.offset; index < totalPages; index++) {
				const startAt = +new Date();
				await page.waitForTimeout(1000);				
				const currentPage = await this.scrapCurrentPage(page, index);
				await page.waitForNavigation();
				const endAt = +new Date();
				
				results = results.concat({
					endAt,
					startAt,
					page: this.page,
					data: currentPage,
					options: this.getOptions(),
				});

				if (index < (totalPages)) {
					this.nextPage();
					await page.goto(this.getUrl());
					await page.waitForNavigation();
				}
			}

			return results;
		} catch (err) {
			this.debug && console.log(`Error: ${err}`.red);
			return results;
		}
	}

	private async scrapCurrentPage (page: Page, row: number) {
		this.debug && console.warn(`Scraping data from page [${row + 1}]: ${page.url()}`.blue);

		let pageData: JudgmentScrap[] = await page.$$eval(this.mainFrameDOM, async (sections: Element[]) => {
			return sections.map((section): JudgmentScrap => {
				const { id } = section;
				const sectionDOM = `.result-container.jud-text.p-15.ng-star-inserted#${id}`;
				const innerHTML = document.querySelector(sectionDOM)?.innerHTML;

				// Título
				const link = document.querySelector(`${sectionDOM} > a`) as HTMLAnchorElement;
				const innerPageUrl = link?.href.trim();
				
				return {
					id: innerPageUrl.split('/search/')[1]?.split('/')[0],
					docId: null,
					innerPageUrl,
					pdfFileUrl: '',
					innerHTML,
					innerPageHTML: '',
				}
			});
		});
		
		// Get PDF URL
		for (let i = 0; i < pageData.length; i++) {
			this.debug && console.log(`\n[${row + 1}:${`${i + 1}] Navigating to`.yellow}: ${pageData[i].innerPageUrl}`);				
			
			await page.goto(pageData[i].innerPageUrl);
			await page.waitForNavigation();
			await page.waitForTimeout(500);
			await page.waitForSelector('.header-icons');	
			
			const iconHandler = await page.evaluateHandle(async () => {
				const nodes = document.querySelectorAll('.header-icons.hide-in-print mat-icon');					
				for(let j = 0; j < nodes.length; j++) {
					if ((nodes[j] as HTMLDivElement).innerText === 'picture_as_pdf') {
						return nodes[j];
					}
				}
			});

			const innerPageData = await page.evaluate(async () => {
				const baseDOM = '.cp-content.display-in-print.ng-star-inserted';
				const innerHTML = document.querySelector(baseDOM)?.innerHTML ?? '';
				
				return { innerHTML }
			});

			this.debug && console.warn('Opening new window with pdf file...'.blue);	
			const pdfFileUrl = await utils.getPdfPageURL(this.browserInstace, page, iconHandler);			
			
			this.debug && console.warn(`${'URL found:'.green} ${pdfFileUrl}`);	
			pageData[i].pdfFileUrl = pdfFileUrl;
			pageData[i].innerPageHTML = innerPageData.innerHTML;
			pageData[i].docId = utils.getDocIdFromPdfUrl(pdfFileUrl);

			await page.goBack();
		}

		return pageData;
	}

	async run() {
		const response = await this.execute();
		console.warn(`\nProcess finished with ${response.length} page(s) scraped`.blue);
		
		return response;
	}

	getOptions()  {
		return this._options;
	}
}
