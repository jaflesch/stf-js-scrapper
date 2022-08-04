const fs = require('fs');
const colors = require('colors');
const pdfDownloader = require('./pdfDownloader');

async function getUrls () {
	try {
		const json = fs.readFileSync("json/data.json", 'utf8');
		const fileData = JSON.parse(json);
		
		return fileData[0].data.map(record => record.pdfFileUrl);		
	} catch(err) {
		console.error("Could not open specified file".red, err);
	}
}

async function download (urls) {
	try {
		const pd  = await pdfDownloader.start(urls);	
		console.log(`${pd}`.magenta);
		
	} catch(err) {
		console.error("An error occurred when downloading pdf files".red, err);
	}
}

module.exports = {
	getUrls,
	download,
}
