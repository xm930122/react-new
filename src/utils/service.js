/**
 * Fetch data
 * @param {string} url
 * @param {Object} options
 * @param {string} [options.method] - Requesst method (GET, POST, PUT, ...),
 * @param {string} [options.payload] - Requesst body, urlParam
 * @param {string} [options.headers]
 * @returns {Promise}
*/
import store from 'store';
import { message } from './message';
import { setLocalStorage, GetLocalStorage, getCookie, MatchApiUrl, getQueryString } from 'utils';
require('es6-promise').polyfill();
require('isomorphic-fetch');

// 错误弹框
const errorToast = (msg, showErrorToast = true) => {
    if (showErrorToast) {
        message.info(msg, 4);
    }
};

// 模拟超时
const _fetch = (requestPromise, timeout) => {
    let timeoutAction = null;
    const TIME_OUT_TEXT = '请求超时，请重试';

    const timerPromise = new Promise((resolve, reject) => {
        timeoutAction = () => reject(new Error(TIME_OUT_TEXT))
    });
    setTimeout(() => {
        timeoutAction()
    }, timeout);
    return Promise.race([requestPromise, timerPromise])
};

// 校验
const _checkConfig = url => {
    const errors = [];
    if (!url) {
        errors.push('url')
    }
    return errors;
};

// 请求封装
const request = (url = '', options = {}) => {
    // 配置项，包括header、method、请求时间
    const config = {
        method: 'GET',
        timeout: 300000,
        showErrorToast: true,
        ...options
    };

    const originUrl = url;
    let isDownloadFile = false;
    if (options.options && options.options.isDownloadFile) {
        isDownloadFile = true;
        delete config.payload.isDownloadFile;
    }

    // 配置项校验
    const errors = _checkConfig(url);
    if (errors.length) {
        throw new Error(`Error! You must pass \`${errors.join('`,`')}\``);
    }
    const importSource = getQueryString('importSource') || getQueryString('originate') || getQueryString('kyzImportSource');
    const kyzAuthCode = getQueryString('kyzAuthCode');
    const kyzAuthState = getQueryString('kyzAuthState');
    const KYZJWT = getQueryString('KYZJWT');
    const hasOtherCode = (kyzAuthCode && kyzAuthState) || KYZJWT;
    let JWT = GetLocalStorage('JWT');
    JWT = (url.indexOf('testToken') > -1 && importSource && !hasOtherCode) ? '' : JWT;

    const INIT_JWT = getCookie('JWTTOKEN') || '';
    JWT = JWT || INIT_JWT;

    let headers = {
        Accept: 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8',
        Authorization: JWT ? `Bear ${JWT}` : '',
        cookie: getCookie,
        ...config.headers,
        'Accept-Language': 'zh-CN'
    };

    // get不需要统一设置 'Content-Type'，避免发送过多option请求影响性能
    // 非get请求，如果没有特别指定 'Content-Type'，需要将其指定为如下值：
    if (config.method !== 'GET') {
        // 增加一个flagFile属性来判断是否发送的是文件
        // 发送文件会自动配置Content-Type，额外添加会报错
        if (config.flagFile) {
            headers = { ...headers };
        } else {
            headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                ...headers
            };
        }
    }

    // 匹配restful API
    let urlParam = '';
    if (config.payload) {
        urlParam = config.payload.urlParam;
        delete config.payload.urlParam;
    }
    if (JSON.stringify(urlParam) !== '{}') {
        url = MatchApiUrl(url, urlParam);
    }

    // 设置fetch参数
    const params = {
        method: config.method,
        headers,
        cache: 'default',
        // mode: 'cors',
        credentials: 'include' // 本地联调时将条件注释
    }

    if (params.method === 'GET') {
        const urlHost = window.location.host;
        // 本地获取地图
        if (urlHost.indexOf('localhost') > -1) {
            const newSearch = new URLSearchParams(config.payload);
            if (newSearch) {
                url = `${url}?${newSearch}`;
            }
        } else {
            url = new URL(url);
            url.search = new URLSearchParams(config.payload);
        }
    } else {
        params.body = typeof config.payload === 'string' ? config.payload : JSON.stringify(config.payload);
        if (config.type === 'file') {
            params.body = config.payload;
        }
    }

    // 请求体
    return new Promise((resolve, reject) => {
        const CONNECTION_OFF_TEXT = '网络开小差，请重试';
        _fetch(fetch(url, params), config.timeout)
        .then(response => {
            if (response.status > 403 && response.status !== 402) {
                return {
                    code: -1,
                    message: CONNECTION_OFF_TEXT
                };
            }

            // JWT认证失败
            // 401和403为jwt校验失败，再次调用testToken校验登录态
            if (response.status === 401 || response.status === 403) {
                setLocalStorage({ JWT: '' });
                return {
                    code: -1,
                    message: ''
                };
            }

            // 获取并更新JWT
            const newJWT = response.headers.get('X-New-Auth-Token');
            if (newJWT) {
                setLocalStorage({ JWT: newJWT });
            }

            // 处理response
            let result;
            if (isDownloadFile) {
                const contentType = response.headers.get('Content-Type');
                const contentDisposition = response.headers.get('Content-Disposition');
                if (contentType.includes('json')) {
                    result = response.json();
                    isDownloadFile = false;
                } else {
                    let fileName = contentDisposition ? 
                    contentDisposition.toLowerCase()
                    .split(';')[1]
                    .split('filename=')[1]
                    : '数据表格.xls';
                    fileName = decodeURIComponent(fileName);
                    result = {
                        response,
                        fileName
                    }
                }
            } else {
                result = response.json();
            }
            return result;
        })
        .then(result => {
            // 登录态校验失败
            const loginTimeOutCodes = [900208, 900304, 900309, 900000];

            // 下载文件流
            if (isDownloadFile) {
                resolve(result);
            }

            if ([0, 1, 200, 900205, '1'].includes(result.code)) {
                // 1 业务接口成功
                // 0 abc newton接口成功
                // 200 登录成功
                // 900205 token 测试成功
                resolve(config.totalResponse ? result : result.data);
            } else {
                // 登录超时：跳转/报错处理
                // testToken 未登录 跳转index
                // 业务校验接口 未登录 跳转login
                const path = (window.location.hash || '').replace(/^#\//, '').split('?')[0];
                const isIndex = path === 'index' || path === '';

                if (loginTimeOutCodes.includes(result.code)) {
                    // 登录超时不弹出错误提示
                    config.showErrorToast = false;

                    // 非首页，未登录弹出登录框
                    if (!isIndex) {
                        // store.dispatch(logout())
                        reject(result);
                        return;
                    }

                    // Token失效退出登录
                    if (isIndex) {
                        // store.dispatch(logout())
                        reject(result);
                        return;
                    }

                    if (isIndex && result.data && result.data.deployType && result.data.deployType === 'INDEPENDENT') {
                        // store.dispatch(logout())
                        reject(result);
                        return;
                    }
                }

                if (isIndex) {
                    config.showErrorToast = false;
                }

                // 部分接口默认不弹出错误提示
                if (config.showErrorToast && !originUrl.includes('testToken') && (result.msg || result.message)) {
                    errorToast(result.msg || result.message);
                }

                reject(result)
            }
        })
        .catch(error => {
            let errorMessage = error.message;
            errorMessage = errorMessage === 'Failed to fetch' ? CONNECTION_OFF_TEXT : errorMessage;
            errorToast(errorMessage, config.showErrorToast);
            reject(error);
        });
    });
};

export default request;
