const fs = require('fs');
const colors = require('colors');
const pdfDownloader = require('./pdfDownloader');
const { Judgement } = require('./models/judgement.model');
const { QueryBuilder } = require('./query-builder');

async function getUrls () {
	try {
		const qb = new QueryBuilder(Judgement).$();
		const result = await qb.find().select({
				id: 1, 
				_id: 0,
				arquivoPdfUrl: 1, 
		});
		
		//console.log(r)
		return result.map(record => record.arquivoPdfUrl);
	} catch(err) {
		console.error(`Could not fetch PDF url list: ${err.message}`.red);
	}
}

async function download (urls) {
	try {
		const pd  = await pdfDownloader.start(urls);	
		//pdfDownloader.createLog(pd);
		console.log(`${JSON.stringify(pd)}`.magenta);
		
	} catch(err) {
		console.error(`An error occurred when downloading pdf files: ${err.message}`.red);
	}
}

module.exports = {
	getUrls,
	download,
}
