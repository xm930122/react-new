/**
 * 申通快递面试算法
 * listArr
 * parentKey:父key
 * key:子key
*/
export const listToTree = (listArr, parentKey, key) => {
    const tree = [];
    const map = new Map();
    listArr.forEach(item => map.set(item[key], {...item}));
    listArr.forEach(item => {
        const node = map.get(item[key]);
        // parentKey为0代表根结点
        if (item[parentKey] === 0) {
            tree.push(node);
        } else {
            // 如果不是根结点，找到对应的父节点
            const parent = map.get(item[parentKey]);
            if (parent) {
                if (!parent.childern) {
                    parent.childern = [];
                }
                parent.childern.push(node);
            }
        }
    })
    return tree;
}