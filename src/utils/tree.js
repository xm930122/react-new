/**
 * 申通快递面试算法
 * listArr
 * parentKey:父key
 * key:子key
 */
export const listToTree = (listArr, parentKey, key) => {
  const tree = [];
  const map = new Map();
  listArr.forEach((item) => map.set(item[key], { ...item }));
  listArr.forEach((item) => {
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
  });
  return tree;
};

// 树结构转list
export const treeToList = (treeArr) => {
  treeArr.reduce((acc, cur) => {
    const { children, ...nodeData } = cur;
    acc.push(nodeData);
    if (children && children.length) {
      acc.push(...treeToList(children));
    }
    return acc;
  }, []);
};

// export function treeToList(tree) {
//   let res = [];
//   tree.forEach((item) => {
//     const { children, ...nodeData } = item;
//     res.push(nodeData);
//     if (children && children.length) {
//       res = res.concat(treeToList(children));
//     }
//   });
//   return res;
// }
