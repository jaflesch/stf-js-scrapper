const fs = require('fs');

export class FileController {
	constructor(
		private readonly rawData: any[]
	){}

	async save (paginated?: boolean, minified?: boolean)  {
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
			
			// Paginated json
			// for (let i = 0; i < scrapedData.length; i++) {
			// 	const folderPath = `${dir}/${i + 1}`;
			// 	if (! fs.existsSync(folderPath)) {
			// 		fs.mkdirSync(folderPath);
			// 	}
				
			// 	const now = new Date();			
			// 	const fileName = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
			// 	fs.writeFile(`${folderPath}/${fileName}.json`, JSON.stringify(scrapedData[i].data), 'utf8', function(err) {
			// 		if(err) {
			// 			return console.log(err);
			// 		}
			// 		console.log("The data has been scrapped and saved successfully! View it at './json/'".green);
			// 	});
			// }
			
			fs.writeFile(`${dir}/data.json`, JSON.stringify(this.rawData), 'utf8', function(err: Error) {
				if(err) {
					return console.log(err);
				}
				console.log("The data has been scrapped and saved successfully! View it at './json/data.json'".green);
			});
			
		} catch (err) {
			console.error(`Error on saving data: ${err}`.red);
		}
	}
}
