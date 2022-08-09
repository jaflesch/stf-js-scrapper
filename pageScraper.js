const utils = require('./utils');
const colors = require('colors');

class PageScraper {
	constructor(browserInstace, options) {
		this.browserInstace = browserInstace;
		this.offset = options.offset > 0 ? options.offset : 1;
		this.limit = options.limit;
		this.rowsPerPage = options.rows;
		this.debug = options.debug;
		this.isAsync = options.async;
		this.parseSort(options.s);
		this.mountUrl();
		this.mainFrameDOM = '.result-container.jud-text.p-15.ng-star-inserted';
	}

	parseSort (sortArgString) {
		const [order, orderBy] = sortArgString.split(',');

		this.order = (order === "score") ? "_score" : "date";
		this.orderBy = (orderBy === "desc") ? "desc" : "asc";
	}

	mountUrl () {
		let baseUrl = 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&sinonimo=true&plural=true&queryString=a';
		baseUrl += `&page=${this.offset}`;
		baseUrl += `&pageSize=${this.rowsPerPage}`;
		baseUrl += `&sort=${this.order}`;
		baseUrl += `&sortBy=${this.orderBy}`;

		this.url = baseUrl;
	}

	async execute () {
		let results = [];
		try {
			this.debug && console.warn(`Starting process`.blue);
			const page = await this.browserInstace.newPage();
			await page.goto(this.url);
			await page.waitForSelector(this.mainFrameDOM);		
			this.debug && console.warn('DOM Tree loaded...'.blue);
	
			let totalPages = this.limit;
			if (totalPages < 1) {
				totalPages = Number(await page.$eval('paginator .pages-resume', text => 
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
					await iconHandler.click();
				}
			}

			return results;
		} catch (err) {
			this.debug && console.log(`Erro: ${err}`.red);
			return results;
		}

	}

	async scrapCurrentPage (page, row) {
		this.debug && console.warn(`Scraping data from page [${row}]'...`.blue);

		let pageData = await page.$$eval(this.mainFrameDOM, async sections => {
			return sections.map((section) => {
				const { id } = section;
				const sectionDOM = `.result-container.jud-text.p-15.ng-star-inserted#${id}`;

				// Título
				const link = document.querySelector(`${sectionDOM} > a`);
				const titulo = link?.innerText.trim();
				const dadosCompletos = link?.href.trim();

				// Cabeçalho
				const header = document.querySelector(`${sectionDOM} #result-principal-header`);
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
				const occurrences = document.querySelectorAll(`${sectionDOM} #other-occurrences > div > div`);
				for (let j = 0; j < occurrences.length; j++) {
					const key = occurrences[j].children[0].innerText;
					const value = occurrences[j].children[1].innerText;
					const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
					
					ocorrencias.push({
						[normalizedKey]: value
					});
				}

				return {
					id: utils.getDocIdFromURL(dadosCompletos),
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
					if (nodes[j].innerText === 'picture_as_pdf') {
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

module.exports = PageScraper;
