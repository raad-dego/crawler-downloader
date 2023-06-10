import puppeteer from 'puppeteer'
import { credentials, URLs } from './config.js'

async function login() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://x.loandisk.com/')

  // Fill in the login form
  await page.type('input[name="userid"]', credentials.email)
  await page.type('input[name="password"]', credentials.password)

  // Submit the login form
  await page.click('button[type="submit"]')

  // Wait for the page to navigate after login
  await page.waitForNavigation()
  // Return the page object to reuse it for URL visits
  return page
}

async function visitURLs(page) {
    // Visit the first URL
  await page.goto(URLs.branchID)

  // Wait for the page to load and perform necessary actions
  await page.waitForSelector('#element-on-first-url')

  // Visit the second URL
  await page.goto(URLs.dailyCollectionURL)

  // Wait for the page to load and perform necessary actions
  await page.waitForSelector('#element-on-second-url')
}


export { login, visitURLs }
