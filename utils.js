async function getOpenedWindowUrl(browser, pageTarget) {
	const newTarget = await browser.waitForTarget(
		target => target.opener() === pageTarget
	);
	const newPage = await newTarget.page();

	const href = await newPage.evaluate(() => document.location.href);
	newPage.close();

	return href;
}

const getPdfPageURL = async (browser, page, elementHandle) => {
	const pageTarget = await page.target();
	await elementHandle.click();
	await page.waitForTimeout(1000);

	return await getOpenedWindowUrl(browser, pageTarget);
}

module.exports = {
	getPdfPageURL,
	getOpenedWindowUrl,
}
