const { chromium } = require("playwright");

const statusUrl = "http://localhost:3010/api/v2/scheduled-maintenances/active.json";

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        const response = await page.goto(statusUrl, { waitUntil: "domcontentloaded" });
        if (!response || !response.ok()) {
            throw new Error(`Status JSON request failed: ${response ? response.status() : "no response"}`);
        }

        const extract2 = await response.text();
        const json_content2 = JSON.parse(extract2);
        const maintenance = (json_content2.scheduled_maintenances || []).length;

        await page.goto(`https://www.google.com/search?q=${maintenance}`, {
            waitUntil: "domcontentloaded"
        });

        console.log(`maintenance=${maintenance}`);
    } finally {
        await browser.close();
    }
})();
