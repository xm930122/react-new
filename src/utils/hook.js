/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useRef, useState } from 'react';
import { isEqual, isFunction } from 'lodash';

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

/**
 * useEffect支持async/await
*/
export function useAsyncEffect(effect, deps) {
    // 判断是AsyncGenerator
    function isAsyncGenerator(val) {
        // Symbol.asyncIterator符号指定了一个对象的默认异步迭代器。如果一个对象设置了这个属性，它就是异步可迭代对象，可用于for await...of循环
        return isFunction(val[Symbol.asyncIterator]);
    }
    useEffect(() => {
        const e = effect();
        // 这个标识可以通过yiedl语句增加一些检查点
        // 如果发现当前effect已经被清理，会停止继续往下执行
        let cancelled = false;
        async function execute() {
            if (isAsyncGenerator(e)) {
                while (true) {
                    const result = await e.next();
                    if (result.done || cancelled) {
                        break;
                    }
                }
            } else {
                await e;
            }
        }
        execute();
        return () => {
            // 当前effect已经被清理
            cancelled = true;
        }
    }, deps)
}