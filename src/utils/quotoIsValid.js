/**
 * 有效的括号:小米面试算法
 * js 有效的括号:
 * 给定一个只包括 '(' ，')' ，'{' ，'}' ，'[' ，']' 的字符串，判断字符串是否有效。
 * 有效字符串需满足：
 * 左括号必须用相同类型的右括号闭合。
 * 左括号必须以正确的顺序闭合。
 * 注意空字符串可被认为是有效字符串
 * 思路：
 * 遍历字符串，将左括号入栈，遇到右括号就将栈顶元素出栈，比较栈顶元素与相应的右括号对应的左括号是否相同，
 * 相同则将栈顶元素出栈，然后继续循环，当stack为空时，也直接返回false。不相同则表示不匹配，返回false。
 * 将右括号作为hash表的键，相应的左括号作为值，存储在map中
*/

export const isValid = (str) => {
    // 如果是基数，直接不满足条件
    if (s.length % 2 !==0) {
        return false;
    }
    // 初始化一个map集合
    const map = new Map([
        [')', '('],
        ['}', '{'],
        [']', '['],
    ]);
    const stack = [];
    for(let i = 0; i < str.length; i++) {
        // 如果当前字符在map中作为键存在，说明匹配到的是右括号
        // 此时需要判断其对应的前一个元素(即栈顶的元素)是否对应的是左括号
        // 是则将将栈顶元素出栈，否则返回false，即不匹配
        if (map.has(s[i])) { // 匹配到的是右括号
            stack.push(s[i]);
            if (!stack.length || stack[stack.length -1] !== map.get(s[i])) {
                return false;
            } else {
                stack.pop();
            }
        } else {
            stack.push(s[i])
        }
    }
    return !stack.length;
}