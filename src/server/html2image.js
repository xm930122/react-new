
const puppeteer = require('puppeteer');
const pathToExtension = require('path').join(__dirname, '..', 'chrome-linux/chrome');

const screenshot = async(html, domSelector, pageViewport, options, remoteContent = false) => {
    if(typeof html !== 'string') {
        throw new Error(
            'Invalid Argument: HTML expected as type of string and received a value of different type. check your request body and request headers.'
        );
    }

    const browser = await puppeteer.lanch({
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: pathToExtension
    });

    const page = await browser.newPage();
    await page.setViewport(pageViewport);

    // disable script request
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.resourceType() === 'script') request.abort();
        else request.continue();
    });

    if (remoteContent === true) {
        await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`, {
            waitUntil: 'networkidle0'
        });
    } else {
        // page.setContent will be faster than page.goto if html is a static
        await page.setContent(html);
    }

    // replace canvas with image
    await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('canvas[base64]'));
        return Promise.all(
            els.map(el => new Promise(resolve => {
                const img = document.createElement('img');
                img.src = el.getAttribute('base64');
                img.style.width = '100%';
                el.parentNode.style.width = '100%';
                el.parentNode.style.height = '';
                el.parentNode.parentNode.style.height = '';
                el.parentNode.replaceChild(img, el);
                img.onload = () => {
                    resolve();
                }
            }))
        );
    });

    const targets = await page.$$(domSelector);
    const images = await Promise.all(
        targets.map(dom => {
            return dom.screenshot(options)
        })
    ).catch( err => {
        browser.close();
        throw new Error(err);
    });

    await browser.close();
    return images;
}

module.exports = (html, domSelector, pageViewport = { width: 1366, height: 900 }, options = { encoding: 'base64' }) => {
    return screenshot(html, domSelector, pageViewport, options);
};