const pdfController = require('./pdfController');

(async function() {
	const urls = await pdfController.getUrls();
	pdfController.download(urls);
})();
