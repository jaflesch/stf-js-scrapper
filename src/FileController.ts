import { CLIArgs } from "./args";

const fs = require('fs');

type FileOptions = {
	minify?: CLIArgs['minify'];
	paginate?: CLIArgs['paginate'];
}

export class FileController {
	private minified = false;
	private paginated = true;

	constructor(
		private readonly rawData: any[],
		private readonly _options?: FileOptions
	){
		this.minified = !!(_options?.minify);
		this.paginated = !!(_options?.paginate);
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
				for (let i = 0; i < this.rawData.length; i++) {
					const folderPath = `${dir}/${i + 1}`;
					if (! fs.existsSync(folderPath)) {
						fs.mkdirSync(folderPath);
					}

					const now = new Date();			
					const fileName = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;

					fs.writeFile(
						`${folderPath}/${fileName}.json`, 
						JSON.stringify(this.rawData[i].data, undefined, this.minified ? undefined : 2), 
						'utf8', 
						function(err: Error) {
							if(err) {
								return console.log(err);
							}
							console.log("The data has been scrapped and saved successfully! View it at './json/'".green);
						}
					);
				}
			} else {
				fs.writeFile(
					`${dir}/data.json`, 
					JSON.stringify(this.rawData, undefined, this.minified ? undefined : 2),
					'utf8', 
					function(err: Error) {
						if(err) {
							return console.log(err);
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
