import Cookies from 'js-cookie';
import { forEach } from 'lodash';

const defaultExpiryDays = 1;

// setLocalStorage, GetLocalStorage, getCookie, MatchApiUrl, getQueryString

export function setLocalStorage(items) {
    forEach(items, (value, key) => {
        value = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(key, value);
    });
}

export function GetLocalStorage(key) {
    const value = localStorage.getItem(key);
    if (!value) {
        return value;
    }
    if (value.substr(0, 1) === '{' || value.substr(0, 1) === '[') {
        return JSON.parse(value);
    }
    return value;
}

export const getDomain = (hostname = window.location.hostname) => {
    if (window.productionDeploymentConfiguration && window.productionDeploymentConfiguration.COOKIE_DOMAIN) {
        return window.productionDeploymentConfiguration.COOKIE_DOMAIN
    } else if (hostname.includes('paic.com')) {
        return '.paic.com.cn';
    } else if (hostname.includes('pingan.com')) {
        return '.pingan.com.cn';
    }
    return hostname;
}

export const getCookie = name => Cookies.get(name);

export const setCookie = (name, value, expires = defaultExpiryDays) {
    const domain = getDomain();
    Cookies.set(name, value, {
        expires,
        domain
    });
}

export const setCookies = (cookieItems) => {
    forEach(cookieItems, (value, key) => {
        setCookie(key, value);
    });
};

export const removeCookie = name => (Cookies.removeCookie(name));

export const removeDomainCookie = (name) => {
    const domain = getDomain();
    Cookies.set(name, '', { expires: -1, domain });
    Cookies.remove();
}

export const removeCookies = (names) => {
    names.forEach(name => {
        removeCookie(name);
        removeDomainCookie(name);
    })
}