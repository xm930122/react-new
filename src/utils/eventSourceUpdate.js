/**
 * 优化连接中断重连逻辑
 * url - 请求地址
 * data - 请求传参
 * successCallback - 消息成功回调
 * closeCallback - 连接关闭回调
 * errorCallback - 错误回调
 * maxRetries - 最大连接次数（默认5）
 * initialDelay - 初始延迟（毫秒）默认1000
 * maxDelay - 最大延迟（毫秒）默认10000
*/

import 'fast-text-encoding';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';
import { cloneDeep } from 'lodash';

class RetriableError extends Error {}; // 重连错误
class FatalError extends Error {};

// let retryAttempts = 0; // 重连次数

export function sseRequest(url, data, successCallback, closeCallback, errorCallback, maxRetries = 5, initialDelay = 1000, maxDelay = 10000) {
    let retryCount = 0;
    const abortController = new AbortController();
    const connect = () => {
        const param = cloneDeep(data);
        delete param.userId;
        fetchEventSource(url, {
            method: 'POST',
            referrerPolicy: 'no-referrer',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': '*/*'
            },
            body: JSON.stringify(data),
            openWhenHidden: true,
            signal: abortController.signal,
            async onopen(response) {
                if (response.headers.get('content-type') === EventStreamContentType && response.ok) {
                    // everything is good
                } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    throw new FatalError()
                } else {
                    throw new RetriableError()
                }
            },
            onmessage(ev) {
                console.log('Received message:', ev.data);
                // 这里可以根据接收到的流式数据更新前端界面
                successCallback(ev)
            },
            onclose() {
                abortController.abort();
                console.log('Connection closed by server');
                if (closeCallback) {
                    closeCallback();
                }
            },
            onerror(err) {
                // console.error('Error received:', err);
                // 手动取消或关闭则不再重新连接
                if (abortController.signal.aborted) {
                    return;
                }
                // 重连逻辑
                if (err instanceof RetriableError) {
                    if (retryCount < maxRetries) {
                        // 指数退避：每次失败后，等待的时间呈指数增长（如1s、2s、4s、8s...）,直到达到上限
                        // 优化：可以加入一个随机抖动，防止多个客户端同时重连，造成“重试洪峰”
                        const jitter = Math.random() * 0.2; // 0~20%的随机抖动
                        const delay = Math.min(
                            initialDelay * Math.pow(2, retryCount) * (1 + jitter),
                            maxDelay
                        );
                        retryCount++;
                        console.log(`正在第${retryCount}次重连，延迟${delay}ms...`);
                        setTimeout(() => {
                            if (!abortController.signal.aborted) {
                                return; // 重新发起连接
                            }
                        }, delay)
                    } else {
                        console.log('重连次数已达上限，停止重连');
                    }
                } else {
                    if (errorCallback) {
                        errorCallback(err)
                    }
                    abortController.abort();
                    throw err;
                }

                // 自定义重连策略
                // if (retryAttempts > 3) {
                //     console.error('重试次数过多，终止连接');
                //     return Promise.resolve(); // 停止重试
                // }
                // retryAttempts++;
                // return new Promise(resolve => setTimeout(resolve, 1000)); // 1秒后重试
            },
        })
    };

    // 启动首次连接
    connect();

    // 返回abortController，外部可调用abort()取消
    return abortController;
}
