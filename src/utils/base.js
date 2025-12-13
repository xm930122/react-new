import _, { unescape } from 'lodash';

// 数据类型的判断
export function getType(obj) {
    let type = typeof obj;
    if (type !== "object") { // 基础数据类型，直接返回（null除外）
        return type;
    }
    return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}

export function ToFloatFixed(num, pos = 2) {
    let s = '';
    if ((num || num === 0) && !isNaN(num)) {
        s = _.round(num, pos).toFixed(pos);
    }
    return s;
}

// 保留n位小数
export function ToPrecision(num, pos = 2) {
    if (isNaN(parseFloat(num))) {
        return false;
    }
    return ToFloatFixed(num, pos);
}

// 千分位保留小数位
export function ToDecimalPoint(text, pos = 2) {
    let result = text.toString();
    if (pos > 0) {
        const currenLen = (text.split('.')[1] && text.split('.')[1].length) || '0';
        const len = pos - currenLen;
        if (currenLen === '0') {
            result += '.';
        }
        for (let i = 0 ; i < len; i++) {
            result += '0';    
        }
    }
    return result;
}

export function formatNumberByDivide(num) {
    if(_.isNaN(num) || _.isUndefined(num)) {
        return '';
    }
    return _.round(_.divide(_.toNumber(num), 100000000), 2).toFixed(2);
}

// 深度优先遍历
export function traverseNodes(nodes, parent, callback, childrenProp = 'children') {
    // 1、使用for循环而不是forEach，因为要支持中止遍历（还可以细分，是要中止整棵树的遍历，还是当前节点的遍历）
    // 2、要获取每个节点的i和parent，如果采用非递归方式实现遍历会比较难写
    for(let i = 0; i < nodes.length; i++) {
        let result = callback(nodes[i], i, parent)
        if (result === traverseNodes.STOP_TRAVERSAL) return traverseNodes.STOP_TRAVERSAL;
        if (nodes[i][childrenProp]) {
            result = traverseNodes(nodes[i][childrenProp], nodes[i], callback, childrenProp);
            if (result === traverseNodes.STOP_TRAVERSAL) return traverseNodes.STOP_TRAVERSAL;
        }
    }
}

traverseNodes.STOP_TRAVERSAL = Symbol('STOP_TRAVERSAL');

// 深度优先，复制一棵树
// 注意：callback必须返回一个新的节点，不是直接把node返回，不然原来的树结构会受到影响！
export function deriveNodes(nodes, parent, callback, childrenProp = 'children') {
    const result = [];
    nodes.forEach((node, i) => {
        const newNode = callback(node, i, parent);

        if (newNode) {
            result.push(newNode);

            if (node[childrenProp]) {
                newNode.children = deriveNodes(node[childrenProp], newNode, callback, childrenProp);
            }
        }
    });
    return result;
}

/*
** decode 是否需要解码
** decodeByURI 使用decodeURIComponent解码
*/

// 获取url参数
export function GetRequestParam(search, decode = true, decodeByURI) {
    const url = decodeURI(search);
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
        const str = url.substr(1);
        const strs = str.split('&');
        for (let i = 0; i < strs.length; i++) {
            if (decode) {
                if (decodeByURI)  {
                    theRequest[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
                } else {
                    theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
                }
            } else {
                theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1];
            }
        }
    }
    return theRequest;
}

/*
** 格式形如'?a=1,2,3'的url search参数，所有参数以数组的形式返回
** decodeByURI 使用decodeURIComponent解码
*/
export function GetSearchParams(search) {
    const params = {};
    search = search.includes('?') ? search.substr(1) : search;
    const strList = search.split('&');
    strList.forEach(str => {
        const [key, value] = str.split('=');
        let decodeValue = decodeURIComponent(value);
        decodeValue = decodeValue ? decodeValue.split(',') : [];
        params[key] = decodeValue;
    })
    return params;
}

// 合并单元格
export function getRowSpanCount(data, key, target) {
    if (!Array.isArray(data)) return 1;
    data = data.map(item => item[key]); // 取出校验的key值
    let prevValue =  data[0]; // 第一次出现的数据
    const res = [[prevValue]]; // 把第一次出现的数据放进一个数组当中
    let index = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i] === prevValue) {
            res[index].push(data[i]); // 如果想等就放进一个篮子
        } else {
            index += 1;
            res[index] = []; // 如果不等，开第二个篮子，把不等的放进去
            res[index].push(data[i]);
            prevValue = data[i]; // 并初始化第一个值
        }
    }

    const arr = [];
    res.forEach(c => { // 循环二维数组
        const len = c.length;
        for(let i = 0; i < len.length; i++) {
            arr.push( i === 0 ? len : 0)
        }
    });
    return arr[target];
}

export const getNet = () => {
    const PAIC = window.location.hostname.includes('pingan') // 外网
    return PAIC;
}

export const timeSort = (dateArr) => {
    return dateArr.sort((a, b) => (new Date(a).getTime() - new Date(b).getTime()))
}

export const getChartObj = (chartDataC, charDataKey) => {
    let xAxias = [];
    chartDataC.forEach(it => {
        const lineData = it[charDataKey] && it[charDataKey].length ? it[charDataKey] : [];
        let data = it['data'] = [];
        lineData.forEach(item => {
            xAxias.push(item.date);
            data.push([item.date, item.value]);
        })
    })
    xAxias = Array.from(new Set(timeSort(xAxias)));
    return { xAxias, chartData: chartDataC };
}

// 统一时间数据，不存在补null
export  const fillMissingDataPoints = (completeAxis, originalData) => {
    let filledData = [];
    completeAxis.forEach(time => {
        // 查找原始数据中是否存在当前时间点
        let found = originalData.find(item => item[0] === time);
        // 如果不存在，就填充null
        if (!found) {
            filledData.push([time, null]);
        }
    });
    // 将原始数据和补充的数据合并
    const newData = originalData.concat(filledData).sort((a, b) => (new Date(a[0]).getTime()  - new Date(b[0]).getTime()));
    return newData;
}

// 格式化chartData数据
export const formatChartData = (chartData, chartDataKey = 'valueList') => {
    const { xAxias, chartData: chartDataC }  = getChartObj(chartData, chartDataKey);
    chartDataC.forEach(item => {
        item.data = fillMissingDataPoints(xAxias, item.data);
    })
    return chartDataC;
}

// export const formatChartData = (xData, chartDataC) => {
//     chartDataC.forEach(item => {
//         item.data = fillMissingDataPoints(xData, item.data);
//     })
//     return chartDataC;
// }




