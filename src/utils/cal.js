// 1、生成从0指定值的数字数组
const getStartAndEndArr = (start, end) => {
    let arr = []
    for(let i = start; i <= end; i++) {
        arr.push(i);
    }
    return arr;
}

console.log(getStartAndEndArr(0, 5), '1--生成从0指定值的数字数组---');

// 2、获取数组的最大值
const getMax = (arr) => Math.max(...arr);

console.log(getMax([1, 5, 3, 11, 20]), '2--获取数组的最大值----');

// 3、获取数组的最小值
const getMin = (arr) => Math.min(...arr);

console.log(getMin([1, 5, 3, 11, 20]), '3--获取数组的最小值----');

// 4、数组去重（filter以及new set实现）
const getUniqueArr = (arr) => {
    return arr.filter((it, index, self) => self.indexOf(it) === index);
}

const getUniqueArr2 = (arr) => {
    return Array.from(new Set([...arr]));
}

console.log(getUniqueArr([1, 2, 3, 3, 2, 1]), '4---数组去重(filter去重)------')
console.log(getUniqueArr2([1, 2, 3, 3, 2, 1]), '4---数组去重(new Set去重)------')

// 5、斐波那契数列 F(n) = F(n-1) + F(n-2) (n>=2)
// F(0) = 0; F(1) = 1, F(2) = 1
const generateFib = (n) => {
    const fibArr = [];
    for(let i = 0; i < n; i++) {
        if (i < 2) {
            fibArr.push(i)
        } else {
            const fibTemp = fibArr[i-1] + fibArr[i-2];
            fibArr.push(fibTemp);
        }
    }
    return fibArr;
}

console.log(generateFib(10), '5--斐波那契数列--');

// 6、递归方法求斐波那契数列第n项
const fib = (num) => {
    if (num < 2) {
        return num
    } else {
        return fib(num-1) + fib(num-2)
    }
}
console.log(fib(10), '6--递归方法求斐波那契数列第n项--');

// 7、动态规划方法求斐波拉契数列第n项
const fib2 = (num) => {
    if (num < 2) {
        return num
    }
    const arr = [0, 1];
    for(let i = 2; i <= num; i++) {
        const fibTemp = arr[0] + arr[1];
        arr.push(fibTemp);
        arr.splice(0, 1);
    }
    return arr[1];
}

console.log(fib2(10), '7--动态规划方法求斐波拉契数列第n项--');

// 8、找出下列正数组的最大差值
const getArrMaxPoint = (arr) => {
    // const sortArr = arr.sort((a,b) => a-b);
    // const maxPoint = sortArr[sortArr.length -1] - sortArr[0];
    // return maxPoint;
    return Math.max(...arr) - Math.min(...arr)
}

console.log(getArrMaxPoint([2, 7, 9, 30, 6, 87, 1, 8]), '8--找出下列正数组的最大差值--');

// 9、冒泡排序
const bunble = (arr) => {
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr.length - i; j++) {
            if (arr[j+1] < arr[j]) {
                let temp = arr[j+1]; // 将小的数组存在temp变量中
                arr[j+1] = arr[j]; // 交换前后的位置，较大的放在后面，较小的放在前面
                arr[j] = temp; // 前面放置较小的数值
            }
        }
    }
    return arr;
}

console.log(bunble([10, 6, 4, 11, 3]), '9--冒泡排序--');

// 10、求数组交集 
const getIntersection = (arr1, arr2) => {
    const arr = arr1.filter(item => arr2.some(it => it === item));
    return arr;
}

const arr1 = [1, 2, 3];
const arr2 = [2, 3, 5, 6];

console.log(getIntersection(arr1, arr2), '10--求数组交集--');

// 11、arrOne在arrTwo中的相对补集
// 其元素属于arrTwo,但不属于arrOne
const complementFn = (arr1, arr2) => {
    const arr = arr2.filter(item2 => arr1.every(item1 => item1 !== item2));
    return arr;
}

const arrOne = [1, 2, 3];
const arrTwo = [2, 3, 5, 6];

console.log(complementFn(arrOne, arrTwo), '11--arrOne在arrTwo中的相对补集--');

// 12、求数组并集
const getUnion = (arr1, arr2) => {
    const arr = arr1.concat(arr2.filter(item => arr2.every(it => it !== item)));
    return arr;
}

const ar1 = [1, 2, 3];
const ar2 = [2, 3, 5, 6];

console.log(getUnion(ar1, ar2), '12--求数组并集--');

// 13、数组加工
const a1 = [
    {
        key: 'name', 
        value: 'Tom'
    },
    {
        key: 'age', 
        value: '18'
    }
]

const processArrToObj = (arr) => {
    const obj = {};
    arr.forEach(it => {
        obj[it.key] = it.value 
    });
    return obj;
}

console.log(processArrToObj(a1), '13--数组加工(数组转对象)--');

// 14、数组求和
const getSum = (arr) => {
    const sum = arr.reduce((pre, cur) => {
        return pre + cur
    }, 0)
    return sum;
}

console.log(getSum([1, 2, 3, 4, 5]), '14--数组求和--');