import colors from 'colors';
const yargs = require('yargs/yargs');

export type PdfListArgs = {
  o: string;
	d: boolean;
  r: boolean;
	debug: boolean;
	output: string;
  rewrite: boolean;
}

export const args: PdfListArgs = yargs(process.argv.slice(2))
	.options({
		'd': {
			alias: 'debug',
			demandOption: false,
			default: false,
			describe: colors.blue('Log de eventos'),
			type: 'boolean'
		},
    'r': {
      alias: 'rewrite',
			demandOption: false,
			default: false,
			describe: colors.blue('Sobrescrever arquivos de mesmo nome'),
			type: 'boolean'
		},
		'o': {
			alias: 'output',
			demandOption: false,
			default: '',
			describe: colors.blue('Caminho relativo para arquivo de output'),
			type: 'string'
		},
	})
	.argv;
