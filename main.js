const puppeteer = require('puppeteer');
const { credentials } = require('./config.js');
const { login, visitURLs } = require('./crawl.js');
const { exit } = require('process');

async function main() {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await login(browser, credentials);

        await visitURLs(page);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    process.exit()
};

main()