/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';

// 用于更新阶段场景
export const uesUpdateEffect = (callback, dependencies) => {
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) {
            callback()
        } else {
            isMounted.current = true;
        }
    }, dependencies) 
}

// 用于useEffect第二个参数是引用类型的场景
export const useDeepCompareEffect = (callback, dependencies, compare) => {
    // 默认的对比函数采用lodash.isEqual，支持自定义
    if (!compare) compare = isEqual;
    const memoizedDependencies = useRef([]);
    if (!compare(memoizedDependencies.current, dependencies)) {
        memoizedDependencies.current = dependencies;
    }
    useEffect(callback, memoizedDependencies.current);
}

// 同步获取最新state
export const useCallbackState = (state) => {
    const callbackRef = useRef();
    const [data, setData] = useState(state);

    useEffect(() => {
        if (callbackRef.current) {
            callbackRef.current(data);
        }
    }, [data])

    return  [data, (val, callback) => {
        callbackRef.current = callback;
        setData(val);
    }]
}