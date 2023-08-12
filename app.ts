import * as pup from "puppeteer"
import * as ax from "axios"

const page_url = "https://www.capitoltrades.com/";
const trades_button_selector = "#__next > div > header > div > div.topnav > nav > li:nth-child(1) > a";

async function get_trades_url() {
    const browser = await pup.launch();
    const page = await browser.newPage();
    await page.setCacheEnabled(false)
    await page.setRequestInterception(true);
    await page.setViewport({ width: 1920, height: 1080});
    let trades_url = "";
    page.on('request', async interceptedRequest => {
        // if the request is already handled, skip its resolution
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        // catch relevent trading data
        if(interceptedRequest.url().endsWith("trades.json")) {
            trades_url = interceptedRequest.url();
        }
        await interceptedRequest.continue();
    });
    // Go to the page and wait for the network to be idle
    await page.goto(page_url, { waitUntil: "networkidle2"});
    await page.screenshot({ path: 'example.png' });
    await page.waitForSelector(trades_button_selector)
    let a = await page.$(trades_button_selector)
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        a?.click()
      ]);
    await browser.close();
    return trades_url;
}

get_trades_url().then(async (trades_url) => console.log(trades_url))