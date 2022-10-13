const { DownloaderHelper } = require('node-downloader-helper');
const colors = require('colors');
import { existsSync, mkdirSync, writeFile } from 'fs';
import path from 'path';

const pdfDownloader = {
	async start(urls, syncDownload = true, destFolder = '../pdf') {
		console.log('..::PDF Scraper::..'.blue);
		console.log(`${urls.length} urls found\n`.blue);

		const responses = [];
		const destinationFolder = path.join(__dirname, destFolder);	
		let currentUrl = '', fileName = '', status = 0;
		
		try {

			if (! existsSync(destinationFolder)) {
				mkdirSync(destinationFolder);
			}

			for (let i = 0; i < urls.length; i++) {
				currentUrl = urls[i];
				console.warn(`[${i + 1}] Downloading file from: ${urls[i]} ...`.yellow);
				fileName = currentUrl.split('&docID=')[1] + '.pdf';
							
				const download = new DownloaderHelper(
					urls[i], 
					destinationFolder, 
					{ fileName }
				);					
				download.on('end', () => console.log('Download completed!\n'.green))
				download.on('error', (err) => console.log('Download failed: '.red, err.status));
				
				let status = 0;
				try {
					await download.start();
				} catch (err) {
					status = err.status;
				}

				responses.push({
					fileName,
					size: status ? download.getTotalSize() : 0,
					error: status,
				});
			}
		}	catch (err) {
			console.log('@@@@@', err);
		}
		
		writeFile(
			path.join(destinationFolder, 'log.json'),
			JSON.stringify(responses, undefined, 2), 
			'utf8', 
			(err) => {
				if(err) {
					feedback = {
						success: false,
						message: err.message,
					}
					console.log(`Error when creating logfile: ${err.message}`.red);					
				}

				console.log(`The data has been scrapped and saved successfully! View it at '${destinationFolder}'`.green);
			}
		);

		return responses;
	}

	
}

module.exports = pdfDownloader;
