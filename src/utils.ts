async function getOpenedWindowUrl(browser: any, pageTarget: any) {
	const newTarget = await browser.waitForTarget(
		(target: any) => target.opener() === pageTarget
	);
	const newPage = await newTarget.page();

	//@ts-ignore
	const href = await newPage.evaluate(() => document.location.href);
	newPage.close();

	return href;
}

const getPdfPageURL = async (browser: any, page: any, elementHandle: any) => {
	const pageTarget = await page.target();
	await elementHandle.click();
	await page.waitForTimeout(1000);

	return await getOpenedWindowUrl(browser, pageTarget);
}

const normalizeString = (string: string) => {
	return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const getDocIdFromURL = (url: string) => {
	// https://jurisprudencia.stf.jus.br/pages/search/<docId>/false
	return url?.split('/search/')[1]?.split('/')[0];
}

export const utils = {
	getPdfPageURL,
	getDocIdFromURL,
	normalizeString,
	getOpenedWindowUrl,
}
