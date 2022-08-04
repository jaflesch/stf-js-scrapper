const yargs = require('yargs/yargs')
const colors = require('colors');
const pdfController = require('./pdfController');

// to do: available args
	/**
	 * @param offset: number 	> initial page to scrap
	 * @param limit: 	number 	> total pages to scrap
	 * @param size: 	number	> results per page
	 * @param sort: 	string	> sort order <(new|old|relevant)(asc|desc)>
	 * @param async: 	boolean	> pdf async downloads
	 * @param debug: 	boolean	> log entries
	*/
const args = yargs(process.argv.slice(2))
.options({
	's': {
		alias: 'size'.yellow,
		demandOption: true,
		default: 10,
		describe: 'Resultados por página'.blue,
		type: 'number'
	}
})
.argv;

(async function() {
	const urls = await pdfController.getUrls();
	pdfController.download(urls);
})();
