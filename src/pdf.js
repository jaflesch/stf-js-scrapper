const yargs = require('yargs/yargs');
const colors = require('colors');
const pdfController = require('./pdfController');

const args = yargs(process.argv.slice(2))
.options({
	'a': {
		alias: 'async'.yellow,
		demandOption: false,
		default: false,
		describe: 'Fazer download assíncronos'.blue,
		type: 'boolean'
	},
	'f': {
		alias: 'folder'.yellow,
		demandOption: false,
		default: 10,
		describe: 'Ordenação dos resultados. Segue o formato <(new|old|relevant)(asc|desc)>'.blue,
		type: 'string'
	}
})
.argv;

(async function() {
	const urls = await pdfController.getUrls();
	pdfController.download(urls);
})();
