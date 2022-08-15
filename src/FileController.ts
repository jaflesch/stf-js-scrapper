const fs = require('fs');
const colors = require('colors');
import { CLIArgs } from "./args";
import { ScrapedData } from "./PageScraper";

type FileOptions = {
	minify?: CLIArgs['minify'];
	paginate?: CLIArgs['paginate'];
}

type Feedback = {
	success: boolean;
	message: string;
}

type ConfigOptionsParams = {
	startAt: Date;
	endAt: Date;
	executionTime: number;
} & CLIArgs;

type ConfigOptionsDTO = {
	startAt: string;
	endAt: string;
	executionTime: string;
	limit: number;
	offset: number;
	rowsPerPage: number;
	order: string;
	orderBy: string;
	minify: boolean;
	paginate: boolean;
	debug: boolean;
}

export class FileController {
	private minified = false;
	private paginated = true;

	constructor(
		private readonly rawData: ScrapedData,
		private readonly _options?: FileOptions
	) {
		this.minified = !!(_options?.minify);
		this.paginated = !!(_options?.paginate);
	}

	private createFileName (name: string) {
		const now = new Date();
		const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
		
		return `${name}@${date}`;
	}

	private mapOptionsToFile (options: ConfigOptionsParams): ConfigOptionsDTO {
		const [orderBy, order] = options.sort.split(',');
		return {
			startAt: options.startAt.toISOString(),
			endAt: options.endAt.toISOString(),
			executionTime: `${options.executionTime}s`,
			limit: options.limit,
			offset: options.offset,
			rowsPerPage: options.rows,
			order,
			orderBy,
			minify: options.minify,
			paginate: options.paginate,
			debug: options.debug,
		}
	}
	
	async save ()  {
		try {
			const dir = './json/';
			if (! fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			if (this.paginated) {
				let feedback: Feedback = {
					success: false,
					message: '',
				};

				for (let i = 0; i < this.rawData.length; i++) {
					const folderPath = `${dir}/${this.rawData[i].page}`;
					if (! fs.existsSync(folderPath)) {
						fs.mkdirSync(folderPath);
					}
					
					// Data files
					fs.writeFile(
						`${folderPath}/${this.createFileName('data')}.json`, 
						JSON.stringify(this.rawData[i].data, undefined, this.minified ? undefined : 2), 
						'utf8', 
						(err: Error) => {
							if(err) {
								feedback = {
									success: false,
									message: err.message,
								}
								return false;								
							}
							feedback = {
								success: true,
								message: "The data has been scrapped and saved successfully! View it at './json/'".green,
							}
						}
					);
				}

				if (feedback) {
					const feedbackColor = feedback.success ? 'green' : 'red';
					console.log(colors[feedbackColor](feedback.message));
				}

				// Config file:
				const lastIndex = this.rawData.length - 1;
				const options = this.rawData[0].options;
				const startAt = this.rawData[0].startAt;
				const endAt = this.rawData[lastIndex].endAt;
				const firstPage = this.rawData[0].page;
				const lastPage = this.rawData[lastIndex].page;

				fs.writeFile(
					`${dir}/${this.createFileName(`config[${firstPage}-${lastPage}]`)}.json`, 
					JSON.stringify(
						this.mapOptionsToFile({
							startAt: new Date(startAt),
							endAt: new Date(endAt),
							executionTime: Math.floor((endAt - startAt) / 1000),
							...options,
						}), 
						undefined, this.minified ? undefined : 2
					), 
					'utf8', 
					(err: Error) => {
						if(err) {
							feedback = {
								success: false,
								message: err.message,
							}
							return false;								
						}
						feedback = {
							success: true,
							message: "Query params configuration file was created at './json'".green,
						}
					}
				);
			} else {
				// Prep config file:
				const options = this.rawData[0].options;
				const startAt = this.rawData[0].startAt;
				const endAt = this.rawData[this.rawData.length - 1].endAt;

				// Data file
				fs.writeFile(
					`${dir}/${this.createFileName('data')}.json`, 
					JSON.stringify(
						this.rawData.map((scrapedData) => ({
							page: scrapedData.page,
							data: scrapedData.data,
						})), 
						undefined, this.minified ? undefined : 2),
					'utf8', 
					(err: Error) => {
						if(err) {
							console.log(`Error when saving file: ${err}`.red);
							return false;
						}
						console.log("The data has been scrapped and saved successfully! View it at './json/data-[dd/MM/yyyy].json'".green);
					}
				);

				// Config file
				fs.writeFile(
					`${dir}/${this.createFileName('config-unified')}.json`, 
					JSON.stringify(
						this.mapOptionsToFile({
							startAt: new Date(startAt),
							endAt: new Date(endAt),
							executionTime: Math.floor((endAt - startAt) / 1000),
							...options,
						}), 
						undefined, this.minified ? undefined : 2
					),
					'utf8', 
					(err: Error) => {
						if(err) {
							console.log(`Error when saving file: ${err}`.red);
							return false;
						}
						console.log("The data has been scrapped and saved successfully! View it at './json/data.json'".green);
					}
				);
			}
		} catch (err) {
			console.error(`Error on saving data: ${err}`.red);
		}
	}
}
