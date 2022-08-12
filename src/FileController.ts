const fs = require('fs');
const colors = require('colors');
import { CLIArgs } from "./args";

type FileOptions = {
	minify?: CLIArgs['minify'];
	paginate?: CLIArgs['paginate'];
}

type Feedback = {
	success: boolean;
	message: string;
}

export class FileController {
	private minified = false;
	private paginated = true;

	constructor(
		private readonly rawData: any[],
		private readonly _options?: FileOptions
	) {
		this.minified = !!(_options?.minify);
		this.paginated = !!(_options?.paginate);
	}

	private createFileName () {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	}

	async save ()  {
		try {
			const dir = './json/';
			if (! fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			/*
			// to do: save scrap general data
				- extraction time (start_at, end_at)
				- extraction params
				- total files
				- total pages
				- sizes...
			*/
			
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
					
					fs.writeFile(
						`${folderPath}/data-${this.createFileName()}.json`, 
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
				const options = this.rawData[0].options;
				const startAt = this.rawData[0].start;
				const endAt = this.rawData[this.rawData.length - 1].end;

				fs.writeFile(
					`${dir}/config-${this.createFileName()}.json`, 
					JSON.stringify({
						startAt: new Date(startAt),
						endAt: new Date(endAt),
						executionTime: Math.floor((endAt - startAt) / 1000),
						...options,
					}, undefined, this.minified ? undefined : 2), 
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

				fs.writeFile(
					`${dir}/data.json`, 
					JSON.stringify(this.rawData, undefined, this.minified ? undefined : 2),
					'utf8', 
					function(err: Error) {
						if(err) {
							console.log(`Error when saving file: ${err}`.red);
							return false;
						}
						console.log("The data has been scrapped and saved successfully! View it at './json/data.json'".green);
					}
				);
				fs.writeFile(
					`${dir}/query-params.json`, 
					JSON.stringify(this.rawData, undefined, this.minified ? undefined : 2),
					'utf8', 
					function(err: Error) {
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
