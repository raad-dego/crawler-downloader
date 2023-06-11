require("dotenv").config()

const credentials = {
    email: process.env.LOANDISK_USER,
    password: process.env.LOANDISK_PASSWORD,
}
const URLs = {
    branchID: 'https://x.loandisk.com/admin/change_branch.php?change_branch=1&branch_id=30045',
    dailyCollectionURL: 'https://x.loandisk.com/collection_sheets/manage_daily_collection_sheet.php?view_daily_collection=1'
}

module.exports = {
    URLs, credentials
}