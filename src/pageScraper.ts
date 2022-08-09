import colors from 'colors';
import { Browser, ElementHandle, EvaluateFunc, JSHandle, Page } from 'puppeteer';
import { CLIArgs } from './args';
import {utils} from './utils';

interface IPageScraper {
	readonly offset: number;
	readonly limit: number;
	readonly rowsPerPage: number;
	readonly debug: boolean;
	readonly isAsync: boolean;
	readonly url: string;
	readonly order: string;
	readonly orderBy: string;
	readonly mainFrameDOM: string;

	mountUrl(): void;
	parseSort(s: string): void;
}

export class PageScraper implements IPageScraper {
	offset;
	limit;
	rowsPerPage;
	debug;
	isAsync;
	mainFrameDOM = '.result-container.jud-text.p-15.ng-star-inserted';
	url: string;
	order: string;
	orderBy: string;

	constructor (
		private readonly browserInstace: Browser, 
		private readonly options: CLIArgs
	) {
		this.browserInstace = browserInstace;
		this.offset = options.offset > 0 ? options.offset : 1;
		this.limit = options.limit;
		this.rowsPerPage = options.rows;
		this.debug = options.debug;
		this.isAsync = options.async;
		this.mainFrameDOM = '.result-container.jud-text.p-15.ng-star-inserted';

		const { order, orderBy } = this.parseSort(options.s);
		this.order = order;
		this.orderBy = orderBy;
		this.url = this.mountUrl();
	}

	parseSort (sortArgString: any) {
		const [order, orderBy] = sortArgString.split(',');

		return {
			order: (order === "score") ? "_score" : "date",
			orderBy: (orderBy === "desc") ? "desc" : "asc",
		}
	}

	mountUrl () {
		let baseUrl = 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&sinonimo=true&plural=true&queryString=a';
		baseUrl += `&page=${this.offset}`;
		baseUrl += `&pageSize=${this.rowsPerPage}`;
		baseUrl += `&sort=${this.order}`;
		baseUrl += `&sortBy=${this.orderBy}`;

		return baseUrl;
	}

	async execute () {
		let results: any = [];
		try {
			this.debug && console.warn(`Starting process`.blue);
			const page = await this.browserInstace.newPage();
			await page
			.goto(this.url);
			await page.waitForSelector(this.mainFrameDOM);		
			this.debug && console.warn('DOM Tree loaded...'.blue);
	
			let totalPages = this.limit;
			if (totalPages < 1) {
				totalPages = Number(await page.$eval('paginator .pages-resume', (text: any) => 
					text.innerText.replace(/[^0-9]+/g, '')
				));
			} 
			totalPages += this.offset;
			
			this.debug && console.warn(`${totalPages} pages to scrap data [${this.offset}-${totalPages}]...`.blue);
	
			for(let index = this.offset; index < totalPages; index++) {
				await page.waitForTimeout(1000);				
				results = results.concat(await this.scrapCurrentPage(page, index));

				if (index >= (totalPages)) {
					await page.waitForNavigation();
					const iconHandler = await page.evaluateHandle(
						() => document.querySelector('paginator ul .pagination-icon .fa-angle-right')
					);

					if (iconHandler instanceof ElementHandle<Element>) {
						await iconHandler.click();
					}
				}
			}

			return results;
		} catch (err) {
			this.debug && console.log(`Erro: ${err}`.red);
			return results;
		}

	}

	async scrapCurrentPage (page: Page, row: number) {
		this.debug && console.warn(`Scraping data from page [${row}]'...`.blue);

		let pageData = await page.$$eval(this.mainFrameDOM, async (sections: any) => {
			return sections.map((section: any) => {
				const { id } = section;
				const sectionDOM = `.result-container.jud-text.p-15.ng-star-inserted#${id}`;

				// Título
				const link = document.querySelector(`${sectionDOM} > a`) as HTMLAnchorElement;
				const titulo = link?.innerText.trim();
				const dadosCompletos = link?.href.trim();

				// Cabeçalho
				const header = document.querySelector(`${sectionDOM} #result-principal-header`) as HTMLDivElement;
				const headerInfo = header.innerText.split('\n');
				
				const orgao = headerInfo[0]?.split(': ')[1];
				const relator = headerInfo[1]?.split(': ')[1];
				let redator, julgamento, publicacao;

				if (headerInfo.length > 4) {
					redator = headerInfo[2]?.split(': ')[1];
					julgamento = headerInfo[3]?.split(': ')[1];
					publicacao = headerInfo[4]?.split(': ')[1];
				} else {
					julgamento = headerInfo[2]?.split(': ')[1];
					publicacao = headerInfo[3]?.split(': ')[1];
				}
				
				// Ocorrências
				const ocorrencias = [];
				const occurrences = document.querySelectorAll(`${sectionDOM} #other-occurrences > div > div`) as NodeListOf<HTMLDivElement>;
				for (let j = 0; j < occurrences.length; j++) {
					const key = (occurrences[j].children[0] as HTMLDivElement).innerText;
					const value = (occurrences[j].children[1] as HTMLDivElement).innerText;
					const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
					
					ocorrencias.push({
						[normalizedKey]: value
					});
				}

				return {
					id: dadosCompletos.split('/search/')[1]?.split('/')[0],
					titulo,
					orgao,
					relator,
					redator, 
					julgamento, 
					publicacao,
					ocorrencias,
					dadosCompletos,
				}
			});
		});
		
		// Obter link do PDF:
		for (let i = 0; i < pageData.length; i++) {
			this.debug && console.log(`\n[${`${i}] Navigating to`.yellow}: ${pageData[i].dadosCompletos}`);				
			
			await page.goto(pageData[i].dadosCompletos);
			await page.waitForSelector('.header-icons.hide-in-print mat-icon');	
			
			const pdfIconHandler = await page.evaluateHandle(async () => {
				const nodes = document.querySelectorAll('.header-icons.hide-in-print mat-icon');					
				for(let j = 0; j < nodes.length; j++) {
					if ((nodes[j] as HTMLDivElement).innerText === 'picture_as_pdf') {
						return nodes[j];
					}
				}
			});

			this.debug && console.warn('Opening new window with pdf file...'.blue);	
			const pdfFileUrl = await utils.getPdfPageURL(this.browserInstace, page, pdfIconHandler);
			
			this.debug && console.warn(`${'URL found:'.green} ${pdfFileUrl}`);	
			pageData[i].pdfFileUrl = pdfFileUrl;
			await page.goBack();
		}

		return {
			page: row, 
			data: pageData,
		}
	}

	async run() {
		const response = await this.execute();
		console.warn(`\nProcess finished with ${response.length} page(s) scraped`.blue);
		
		return response;
	}
}
