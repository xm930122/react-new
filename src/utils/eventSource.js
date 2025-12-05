import 'fast-text-encoding';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';

class RetriableError extends Error {};
class FatalError extends Error {};

export function sseRequest(url, data, successCallback, closeCallback, errorCallback) {
    const abortController = new AbortController();
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
            abortController.abort();
            // console.error('Error received:', err);
            if (errorCallback) {
                errorCallback(err)
            }
            throw err;
        },
    })
}
