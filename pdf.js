const yargs = require('yargs/yargs')
const colors = require('colors');
const pdfController = require('./pdfController');

const args = yargs(process.argv.slice(2))
.options({
	'l': {
		alias: 'limit'.yellow,
		demandOption: false,
		default: 0,
		describe: 'Total de páginas'.blue,
		type: 'number'
	},
	'o': {
		alias: 'offset'.yellow,
		demandOption: false,
		default: 1,
		describe: 'Página inicial'.blue,
		type: 'number'
	},
	'r': {
		alias: 'rows'.yellow,
		demandOption: true,
		default: 10,
		describe: 'Resultados por página'.blue,
		type: 'number'
	},
	'd': {
		alias: 'debug'.yellow,
		demandOption: false,
		default: false,
		describe: 'Log de eventos'.blue,
		type: 'boolean'
	},
	'a': {
		alias: 'async'.yellow,
		demandOption: false,
		default: false,
		describe: 'Fazer download assíncronos'.blue,
		type: 'boolean'
	},
	's': {
		alias: 'sort'.yellow,
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
