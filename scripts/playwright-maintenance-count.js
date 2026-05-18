const response = await page.goto(statusUrl, { waitUntil: "domcontentloaded" });
if (!response || !response.ok()) {
    throw new Error(`Status JSON request failed: ${response ? response.status() : "no response"}`);
}

const extract2 = await response.text();
const json_content2 = JSON.parse(extract2);
const maintenance = (json_content2.scheduled_maintenances || []).length;
await Catchpoint.setIndicator("main1", maintenance);
await Catchpoint.setIndicator("main2", maintenance);
await Catchpoint.setIndicator("randnum", randNum);
await page.goto(`https://www.google.com/search?q=${maintenance}`, {
    waitUntil: "domcontentloaded"
});
