const yargs = require('yargs/yargs');
const colors = require('colors');

const args = yargs(process.argv.slice(2))
	.options({
		'l': {
			alias: 'limit',
			demandOption: false,
			default: 0,
			describe: 'Total de páginas (0 = sem limite)'.blue,
			type: 'number'
		},
		'o': {
			alias: 'offset',
			demandOption: false,
			default: 1,
			describe: 'Página inicial'.blue,
			type: 'number'
		},
		'r': {
			alias: 'rows',
			demandOption: false,
			default: 10,
			describe: 'Resultados por página'.blue,
			type: 'number'
		},
		'd': {
			alias: 'debug',
			demandOption: false,
			default: false,
			describe: 'Log de eventos'.blue,
			type: 'boolean'
		},
		'a': {
			alias: 'async',
			demandOption: false,
			default: false,
			describe: 'Fazer download assíncronos'.blue,
			type: 'boolean'
		},
		's': {
			alias: 'sort',
			demandOption: false,
			default: 'date,desc',
			describe: 'Ordenação dos resultados. Segue o formato <(date|score),(asc|desc)>'.blue,
			type: 'string'
		}
	})
	.argv;

module.exports = {
	args
};
