const scraperObject = {
	url: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&sinonimo=true&plural=true&page=1&pageSize=10&queryString=a&sort=_score&sortBy=desc',
	async scraper(browser) {
		const mainFrameDOM = '.result-container.jud-text.p-15.ng-star-inserted';
		
		const main = async () => {			
			console.warn(`Navigating to ${this.url}...`);
			const page = await browser.newPage();
			await page.goto(this.url);
			await page.waitForSelector(mainFrameDOM);		
			console.warn('DOM Tree loaded...');
			
			const totalPages = Number(await page.$eval('paginator .pages-resume', text => 
				text.innerText.replace(/[^0-9]+/g, '')
			));
			console.warn('Found ' + totalPages + ' pages to scrap data...');	

			const lastPageNumber = 4;
			let results = [];
			for(let index = 1; index < lastPageNumber; index++) {
				await page.waitForTimeout(1000);
				
				const iconHandler = await page.evaluateHandle(
					() => document.querySelector('paginator ul .pagination-icon .fa-angle-right')
				);
				
				results = results.concat(await scrapCurrentPage(page, index));
				if (index != (lastPageNumber - 1)) {
					await iconHandler.click();
				}
			}

			return results;
		}
		
		async function scrapCurrentPage(page, row) {
			console.warn('Scrapping data from page ' + row + '...');
			let pageData = await page.$$eval(mainFrameDOM, async sections => {
				return sections.map((section) => {
					const { id } = section;
					const sectionDOM = `.result-container.jud-text.p-15.ng-star-inserted#${id}`;

					// Título
					const link = document.querySelector(`${sectionDOM} > a`);
					const titulo = link?.innerText.trim();
					const dados_completos = link?.href.trim();

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
						titulo,
						dados_completos,
						orgao,
						relator,
						redator, 
						julgamento, 
						publicacao,
						ocorrencias,
					}
				});
			});

			return {
				page: row, 
				data: pageData,
			}
		}

		const response = await main();
		console.warn('Finishing process...');
		console.warn(response.length + ' pages scrapped');
		
		return response;
	}
}

module.exports = scraperObject;
