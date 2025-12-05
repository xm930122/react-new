// js四则运算精度丢失问题

// https://www.cnblogs.com/lichanglong0/p/10528488.html

// 获取小数长度
const getDecimalsLength = (num) => (num.toString().split('.')[1] ? num.toString().split('.')[1].length : 0);

// 获取最大长度
const getMaxLength = (num1, num2) => {
    const num1Length = getDecimalsLength(num1);
    const num2Length = getDecimalsLength(num2);
    const p = Math.max(num1Length, num2Length);
    const times = Math.pow(10, p);
    return times;
}

// 乘法
export function mul(num1, num2) {
    const intNum1 = num1.toString().replace('.', '');
    const intNum2 = num2.toString().replace('.', '');
    const countDecimals = getDecimalsLength(num1) + getDecimalsLength(num2);
    return (intNum1 * intNum2) / Math.pow(10, countDecimals);
}

// 除法
export function divide(num1, num2) {
    const times = getMaxLength(num1, num2);
    return (mul(num1, times) / mul(num2, times));
}

// 减法
export function subtraction(num1, num2) {
    const times = getMaxLength(num1, num2);
    return (num1 * times - num2 * times) / times;
}

// 加法
export function add(num1, num2) {
    const times = getMaxLength(num1, num2);
    return (num1 * times + num2 * times) / times;
}