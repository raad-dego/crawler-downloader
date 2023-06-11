const axios = require('axios')
const puppeteer = require('puppeteer')
const { credentials, URLs } = require('./config.js')
const fs = require('fs')

// Rest of the code remains the same


async function login() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('https://x.loandisk.com/')

    // Fill in the login form
    await page.type('input[name="userid"]', credentials.email)
    await page.type('input[name="password"]', credentials.password)

    // Submit the login form
    await page.click('button[type="submit"]')
    console.log('login success')
    // Wait for the page to navigate after login
    await page.waitForNavigation()
    // Return the page object to reuse it for URL visits
    return page
}

async function selectDate(page) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const year = sixMonthsAgo.getFullYear();
    const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, '0');
    const day = String(sixMonthsAgo.getDate()).padStart(2, '0');

    const formattedDate = `${year}/${month}/${day}`;

    await page.evaluate((date) => {
        const element = document.querySelector('#inputFromCollectionDate');
        if (element) {
            element.value = date;
        }
    }, formattedDate);
}

async function visitURLs(page) {
    try {
        console.log(`Visiting URL #1: ${URLs.branchID}`);
        await page.goto(URLs.branchID);
        await page.waitForSelector('body > div.wrapper > div > section.content > div > h4');
        console.log('Successfully navigated to URL #1');

        console.log(`Visiting URL #2: ${URLs.dailyCollectionURL}`);
        await page.goto(URLs.dailyCollectionURL);
        await page.waitForSelector('body > div.wrapper > div > section.content > div > div > form > div:nth-child(17) > div > button:nth-child(3)');
        console.log('Successfully navigated to URL #2');

        // On the second URL, select the date
        await selectDate(page);
        console.log('Date selected successfully');

        // Find and click the download button
        const downloadButton = await page.$(
            'body > div.wrapper > div > section.content > div > div > form > div:nth-child(17) > div > button:nth-child(3)'
        );

        if (downloadButton) {
            const newPagePromise = new Promise((resolve) => page.once('popup', resolve))
            await downloadButton.click();
            console.log('Download button clicked');
            // Wait for the new tab to load

            const newPage = await newPagePromise;
            await newPage.waitForSelector("body > div:nth-child(4) > div > div > h4 > a");
            // Get the downloaded file's location
            const downloadPath = await newPage.evaluate(() => {
                return document.querySelector("body > div:nth-child(4) > div > div > h4 > a").href;
            });

            console.log('Downloaded url:', downloadPath);
            // Call the download function
            await downloadFileFromURL(downloadPath);
            await newPage.close(); // Close the new tab after the Download

        } else {
            console.log('Download button not found.');
        }
        await page.close()
    } catch (error) {
        throw new Error(error.message)

    }
}


async function downloadFileFromURL(downloadURL) {
    try {
        const response = await axios({
            url: downloadURL,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream('./data.csv');
        const totalBytes = parseInt(response.headers['content-length'], 10);
        let bytesDownloaded = 0;

        response.data.on('data', (chunk) => {
            bytesDownloaded += chunk.length;
            let percentageDownloaded = (bytesDownloaded / totalBytes) * 100;
            console.log('Downloaded:', percentageDownloaded + '%');
            writer.write(chunk); // Write the chunk to the file
        });

        response.data.on('end', () => {
            writer.end(); // Close the write stream when the response ends
            console.log('Download finished');
        });

        response.data.on('error', (error) => {
            console.error('Error occurred during file download:', error);
        });

        return
    } catch (error) {
        throw new Error(
            `an error ocurred while downloading file: ${error.message}`
        )
    }
}



module.exports = { login, visitURLs, downloadFileFromURL, selectDate }
