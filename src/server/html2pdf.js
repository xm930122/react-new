
const puppeteer = require('puppeteer');
const pathToExtension = require('path').join(__dirname, '..', 'chrome-linux/chrome');

const convertHTMLTOPDF = async(html, options, remoteContent = false) => {
    if (typeof html !== 'string') {
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

    const pdf = await page.pdf(options).catch(err => {
        browser.close();
        throw new Error(err);
    });

    await browser.close();
    return pdf;
}

module.exports = (html, options) => {
    if (!options.margin || typeof options.margin === 'number' ) {
        const num = options.margin || 30;
        options.margin = {
            top: num,
            left: num,
            right: num,
            bottom: num
        }
    }

    return convertHTMLTOPDF(html, {
        printBackground: true,
        '-webkit-print-color-adjust': 'exact',
        ...options
    });
};