const { DownloaderHelper } = require('node-downloader-helper');
const colors = require('colors');

const pdfDownloader = {
	async start(urls, syncDownload = true) {
		console.log('..::PDF Scraper::..'.blue);

		let responses = [];
		for (let i = 0; i < urls.length; i++) {
			console.warn(`[${i + 1}] Downloading from ${urls[i]} ...`.yellow);
			const fileName = urls[i].split('&docID=')[1] + '.pdf';
			const download = new DownloaderHelper(urls[i], `${__dirname}/pdf`, { fileName });
			
			download.on('end', () => console.log('Download completed!\n'.green))
			download.on('error', (err) => console.log('Download failed'.red, err));

			try {
				if (syncDownload) {
					await download.start();
				} else {
					download.start();
				}
			} catch (err) {}
			
			responses.push({
				fileName,
				size: download.getTotalSize()
			});
		}

		return responses;
	}
}

module.exports = pdfDownloader;
