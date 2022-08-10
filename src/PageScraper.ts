const colors = require('colors');
import { Browser, ElementHandle, Page } from 'puppeteer';
import { CLIArgs } from './args';
import { utils } from './utils';

export type Judgment = {
	id: string;
	titulo: string;
	orgao: string;
	relator: string;
	redator?: string | undefined; 
	dataJulgamento: string; 
	dataPublicacao: string,
	ocorrencias: Array<
		{[x: string]: string
	}>;
	dadosCompletos: string;
	innerHTML: string | undefined;
	pdfFileUrl: string | null;
	docId: string | null;
	innerPage: {
		dje: string;
		titulo: string;
		subtitulo: string;
		publicacao: string;
		innerHTML: string | undefined;
	}
}

export class PageScraper {
	private offset: number;
	private limit: number;
	private rowsPerPage: number;
	private debug: boolean;
	private isAsync: boolean;
	private url: string;
	private order: string;
	private orderBy: string;
	private mainFrameDOM = '.result-container.jud-text.p-15.ng-star-inserted';

	constructor (
		private readonly browserInstace: Browser, 
		private readonly _options: CLIArgs
	) {
		this.browserInstace = browserInstace;
		this.offset = _options.offset > 0 ? _options.offset : 1;
		this.limit = _options.limit;
		this.rowsPerPage = _options.rows;
		this.debug = _options.debug;
		this.isAsync = _options.async;
		
		const { order, orderBy } = this.parseSort(_options.s);
		this.order = order;
		this.orderBy = orderBy;
		this.url = this.mountUrl();
	}

	private parseSort (sortArgString: any) {
		const [order, orderBy] = sortArgString.split(',');

		return {
			order: (order === "score") ? "_score" : "date",
			orderBy: (orderBy === "desc") ? "desc" : "asc",
		}
	}

	private mountUrl () {
		let baseUrl = 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&sinonimo=true&plural=true&queryString=a';
		baseUrl += `&page=${this.offset}`;
		baseUrl += `&pageSize=${this.rowsPerPage}`;
		baseUrl += `&sort=${this.order}`;
		baseUrl += `&sortBy=${this.orderBy}`;

		return baseUrl;
	}

	private async execute () {
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

	private async scrapCurrentPage (page: Page, row: number) {
		this.debug && console.warn(`Scraping data from page [${row}]'...`.blue);

		let pageData: Judgment[] = await page.$$eval(this.mainFrameDOM, async (sections: Element[]) => {
			return sections.map((section) => {
				const { id } = section;
				const sectionDOM = `.result-container.jud-text.p-15.ng-star-inserted#${id}`;
				const innerHTML = document.querySelector(sectionDOM)?.innerHTML;

				// Título
				const link = document.querySelector(`${sectionDOM} > a`) as HTMLAnchorElement;
				const titulo = link?.innerText.trim();
				const dadosCompletos = link?.href.trim();

				// Cabeçalho
				const header = document.querySelector(`${sectionDOM} #result-principal-header`) as HTMLDivElement;
				const headerInfo = header.innerText.split('\n');
				
				const orgao = headerInfo[0]?.split(': ')[1];
				const relator = headerInfo[1]?.split(': ')[1];
				let redator, dataJulgamento, dataPublicacao;

				if (headerInfo.length > 4) {
					redator = headerInfo[2]?.split(': ')[1];
					dataJulgamento = headerInfo[3]?.split(': ')[1];
					dataPublicacao = headerInfo[4]?.split(': ')[1];
				} else {
					dataJulgamento = headerInfo[2]?.split(': ')[1];
					dataPublicacao = headerInfo[3]?.split(': ')[1];
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
					dataJulgamento, 
					dataPublicacao,
					ocorrencias,
					dadosCompletos,
					innerHTML,
					pdfFileUrl: '',
					docId: null,
					innerPage: {
						dje: '',
						titulo: '',
						subtitulo: '',
						publicacao: '',
						innerHTML: '',
					}
				}
			});
		});
		
		// Obter link do PDF:
		for (let i = 0; i < pageData.length; i++) {
			this.debug && console.log(`\n[${row}:${`${i + 1}] Navigating to`.yellow}: ${pageData[i].dadosCompletos}`);				
			
			await page.goto(pageData[i].dadosCompletos);
			await page.waitForSelector('.header-icons.hide-in-print mat-icon');	
			
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
				const baseHeaderDOM = `${baseDOM} > div > div`;
				
				const innerHTML = document.querySelector(baseDOM)?.innerHTML;
				const titulo = (
					document.querySelector(`${baseHeaderDOM} > h4:first-child`
				) as HTMLHeadingElement).innerText;

				const subtitulo = (
					document.querySelector(`${baseHeaderDOM} > h4:nth-child(2)`
				) as HTMLHeadingElement).innerText;
				
				const publicacaoRaw = (
					document.querySelector(`${baseDOM} > div:nth-child(3) > div`
				) as HTMLDivElement).innerText;
				const [publicacao, diario] = publicacaoRaw.split('\n');			
				
				return {			
					titulo,
					subtitulo,
					publicacao,
					dje: diario.split(' ')[0],
					innerHTML
				}
			});

			this.debug && console.warn('Opening new window with pdf file...'.blue);	
			const pdfFileUrl = await utils.getPdfPageURL(this.browserInstace, page, iconHandler);			
			
			this.debug && console.warn(`${'URL found:'.green} ${pdfFileUrl}`);	
			pageData[i].pdfFileUrl = pdfFileUrl;
			pageData[i].innerPage = innerPageData;
			pageData[i].docId = utils.getDocIdFromPdfUrl(pdfFileUrl);

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

	getOptions()  {
		return this._options;
	}
}
