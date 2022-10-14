const { DownloaderHelper } = require('node-downloader-helper');
const colors = require('colors');
import { existsSync, mkdirSync, writeFile, readdirSync, createWriteStream } from 'fs';
import path from 'path';

const pdfDownloader = {
	async start(urls, syncDownload = true, destFolder = '../pdf') {
		console.log('..::PDF Scraper::..'.blue);
		console.log(`${urls.length} urls found\n`.blue);

		const responses = [];
		const destinationFolder = path.join(__dirname, destFolder);	
		const logStream = createWriteStream(path.join(destinationFolder, 'log.txt'), {flags: 'a'});
		let currentUrl = '', fileName = '', status = 0;

		const filesMap = new Set([
			...readdirSync(destinationFolder)
		]);
		
		const filteredUrls = [];
		for (let i = 0; i < urls.length; i++) {
			fileName = urls[i].split('&docID=')[1] + '.pdf';
			if (! filesMap.has(fileName)) {
				filteredUrls.push(urls[i]);
			}
		}

		try {
			if (! existsSync(destinationFolder)) {
				mkdirSync(destinationFolder);
			}		
			
			for (let i = 0; i < filteredUrls.length; i++) {
				currentUrl = filteredUrls[i];
				console.warn(`[${i + 1}] Downloading file from: ${filteredUrls[i]} ...`.yellow);
				fileName = currentUrl.split('&docID=')[1] + '.pdf';
							
				const download = new DownloaderHelper(
					filteredUrls[i], 
					destinationFolder, 
					{ fileName }
				);					
				download.on('end', () => console.log('Download completed!\n'.green))
				download.on('error', (err) => console.log('Download failed: '.red, err.status));
				
				let status = 0, size = 0;
				try {
					await download.start();
				} catch (err) {
					status = err.status ?? 500;
				}
				
				if (status === 0) {
					const totalSize = await download.getTotalSize();
					size = totalSize.total;
				}
				
				responses.push({
					pdfUrl: filteredUrls[i],
					fileName,
					size,
					error: status,
				});
				logStream.write(`${status}\t${filteredUrls[i]}\t${size}\n`)
			}
		}	catch (err) {
			console.log('@@@@@', err);
		} finally {
			logStream.end();
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
