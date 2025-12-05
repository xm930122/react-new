/* eslint-disable no-restricted-globals */
import request from 'axios';
import { message } from 'antd';
import { getNet } from './base';

const net = getNet();
const DOWNLOAD_URL = 'http://30.79.13.110/html2pdf';
const DOWNLOAD_IMAGE_URL = 'http://30.79.13.110/html2image';

const canvas2base64 = () => {
    const arr = document.querySelectorAll('canvas');
    return [...arr].map(el => {
        el.setAttribute('base64', 'canvas-base64');
        const b64 = el.toDataURL('image/jpg');
        return b64.length < 10 ? '' : b64;
    })
}

export const html2pdf = (html, options = {}) => {
    const filename = document.title;
    const hide = message.loading('正在生成导出文件，请稍后...', 0);
    request({
        url: DOWNLOAD_URL,
        method: 'POST',
        responseType: 'arraybuffer',
        withCredentials: false,
        data: { html, options }
    }).then(res => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
        link.remove();
    }).catch(err => {
        hide();
        message.warning('导出服务不可用，请稍后再试');
        console.log(err);
    })
}

const conventHtml = (dom) => {
    if (typeof dom === 'string') dom = document.querySelector(dom);
    if (net) {
        message.warning('导出功能暂不支持外网使用');
        return null
    }
    const root = document.body;
    if (!dom || !root.contains(dom))  return null;
    let stack = [root];
    while (stack.length) {
        let brr = [];
        stack.forEach(node => {
            if (node.contains(dom)) {
                node.className += ' print';
                if (node !== dom) {
                    brr = [...node.children];
                }
            } else {
                node.className += ' noprint';
            }
        });
        stack = brr;
    }

    const base64 = canvas2base64();
    let html = document.documentElement.outerHTML;
    // refresh
    [...document.getElementsByClassName('print')].forEach(it => it.removeClass(it, 'print'));
    [...document.getElementsByClassName('noprint')].forEach(it => it.removeClass(it, 'noprint'));

    // canvas
    let index = 0;
    html = html.replace(/base64="canvas-base64"/g, () => `base64="${base64[index++]}"`);
    // resource link
    html = html.replace(/(src|href)(=.)\/fund/g, '$1$2http://127.0.0.1:8080/fund');
    if (/test/.test(location.hostname)) {
        [...document.styleSheets].forEach(item => {
            const cssText = [...item.rules].map(it => it.cssText).join('');
            html = html.replace('</body>', `<style type="text/css">${cssText}</style></body>`)
        })
    }
    return html;
}

export const printToPDF = (dom, options) => {
    const html = conventHtml(dom);
    html2pdf(html, options);
}

// 封装方法到项目全局方法中
window.printToPDF = printToPDF;

/**
 * dom 生成图片 base64
 * @param {string} domSelector
 * @param {Object} pageViewport 默认值{ width: 1366, heught: 768 }
 */

export const dom2image = (domSelector, pageViewport) => {
    if (!domSelector) return Promise.reject();
    const html = conventHtml(domSelector);
    return request({
        url: DOWNLOAD_IMAGE_URL,
        method: 'POST',
        withCredentials: false,
        data: { html, domSelector, pageViewport}
    }).then(res => res.data).then(res => {
        if (res.type === 'success') {
            return res.message.map(it => `data:image/png;base64,${it}`)

        }
        throw new Error(res.message);
    });
}

const base64ToBlob =  (code) => {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1]; // 解析base64得到二进制字符串
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength); // 创建8位无符号整数值的类型化数组
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i); // 数组接收二进制字符串
    }
    return new Blob([uInt8Array], {
      type: contentType
    });
};

/**
 * 下载Base64图片到本地
 * @param {*} content base64
 * @param {*} fileName 下载文件名
 */
const downloadBase64 = (content, fileName) => {
    // let aLink = document.createElement('a');
    // let blob = base64ToBlob(content); //new Blob([content]);
    // aLink.download = fileName + '.png';
    // aLink.href = URL.createObjectURL(blob);
    // aLink.click();
    let aLink = document.createElement('a');
    let blob = base64ToBlob(content); //new Blob([content]);
    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    // aLink.dispatchEvent(evt);
    aLink.click()
};

/*
dom2image1: dom2image方法的改写，下载base64格式的图片到本地
*/

export const dom2image1 = (domSelector, pageViewport) => {
    if (!domSelector) return Promise.reject();
    const html = conventHtml(domSelector);
    return request({
        url: DOWNLOAD_IMAGE_URL,
        method: 'POST',
        withCredentials: false,
        data: { html, domSelector, pageViewport}
    }).then(res => res.data).then(res => {
        if (res.type === 'success') {
            // return res.message.map(it => `data:image/png;base64,${it}`)
            const srcArr = res.message.map(it => `data:image/png;base64,${it}`) || [];
            srcArr.forEach(item => {
                downloadBase64('base64图片本地下载', item);
            })
        } else {
            throw new Error(res.message);
        }
    });
}

export const printToImage = (domSelector, pageViewport) => {
    dom2image1(domSelector, pageViewport);
}

// 封装方法到项目全局方法中
window.printToImage = printToImage;
  