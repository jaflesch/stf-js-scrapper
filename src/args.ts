const yargs = require('yargs/yargs');
const colors = require('colors');

export type CLIArgs = {
	l: number;
	o: number;
	r: number;
	d: boolean;
	a: boolean;
	s: string;
	m: boolean;
	limit: number;
	offset: number;
	rows: number;
	debug: boolean;
	async: boolean;
	sort: string;
	minify: boolean;
}

export const args = yargs(process.argv.slice(2))
	.options({
		'l': {
			alias: 'limit',
			demandOption: false,
			default: 0,
			describe: colors.blue('Total de páginas (0 = sem limite)'),
			type: 'number'
		},
		'o': {
			alias: 'offset',
			demandOption: false,
			default: 1,
			describe: colors.blue('Página inicial'),
			type: 'number'
		},
		'r': {
			alias: 'rows',
			demandOption: false,
			default: 10,
			describe: colors.blue('Resultados por página'),
			type: 'number'
		},
		'd': {
			alias: 'debug',
			demandOption: false,
			default: false,
			describe: colors.blue('Log de eventos'),
			type: 'boolean'
		},
		'a': {
			alias: 'async',
			demandOption: false,
			default: false,
			describe: colors.blue('Fazer download assíncronos'),
			type: 'boolean'
		},
		's': {
			alias: 'sort',
			demandOption: false,
			default: 'date,desc',
			describe: colors.blue('Ordenação dos resultados. Segue o formato <(date|score),(asc|desc)>'),
			type: 'string'
		},
		'm': {
			alias: 'minify',
			demandOption: false,
			default: false,
			describe: colors.blue('Minifica JSON(s) gerado'),
			type: 'boolean'
		}
	})
	.argv;
