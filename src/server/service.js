const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const html2pdf = require('./html2pdf.js');
const html2image = require('./html2image.js');
const app = express();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));
app.use(compression());
app.use(express.static(`${__dirname}/dist`));

const Router = express.Router;
const router = new Router();
router.get('/html2pdf', (req, res) => {
    res.send({
        msg: 'alive'
    });
});

router.all('/html2pdf', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    const { html, options, filename = ''  } = req.body

    if (typeof html !== 'string') {
        res.send({
            type: 'error',
            errorMsg: 'need param html string'
        });
        return;
    }

    html2pdf(html, options).then(pdf => {
        res.header('Content-Type', 'application/pdf');
        res.header('content-disposition', filename);
        res.send(pdf);
    }).catch(err => {
        res.status(503);
        res.send({
            type: 'error',
            errorMsg: err.message || '服务异常'
        });
    });
});

router.all('/html2image', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    const { html, domSelector, pageViewport } = req.body

    if (typeof html !== 'string') {
        res.send({
            type: 'error',
            errorMsg: 'need param html string'
        });
        return;
    }

    html2image(html, domSelector, pageViewport).then(images => {
        res.send({
            type: 'success',
            message: images

        });
    }).catch(err => {
        res.status(503);
        res.send({
            type: 'error',
            errorMsg: err.message || '服务异常'
        });
    });
});

router.get('/*', (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`);
});

app.use(router);
app.listen(8080);
console.log('服务启动成功');

