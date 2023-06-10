require = require('esm')(module)
const { login, visitUrls } = require('./crawl.js')

async function main() {
    const page = await login()
    await visitUrls(page)
    // You can add more function calls or perform additional actions here
}

main()
