/**
 * 接入集团的js iobs sdk，支持大文件上传
 * 
 * */
import 'iobs-js-sdk';
import message from './message'; // antd5版本封装message
import request from './service'; 

const isStg = /local|stg|dev|test/.test(window.location.hostname);

const config = isStg ? {
    host: 'https://stg-iobs.pingan.com.cn',
    bucket: 'ivs-sdp-dmz-stg'
} : {
    host: 'https://iobs-upload.pingan.com.cn',
    bucket: 'ivs-sdp-credit-dmz-prd-pri'
};

let uploadToken = '';

export const refreshToken = (fileKey, filename) => request('/asi-ai/iobs', {
    payload: {
        audioKey: fileKey,
        audioName: filename
    },
    method: 'POST', 
    showErrorToast: false
})
.then((res) => {
    uploadToken = res;
})
.catch((err) => {
    message.warning(err.data)
});

export default async function({
    file, onError, onSuccess, onProgress
}) {
    const key = file.uid;
    const fileName = file.name;
    const { host, bucket } = config;
    const iobsService = new window.IobsService(host);

    await refreshToken(key, fileName);
    if (uploadToken === '') return onError();

    const token = function() {
        refreshToken(key, fileName);
        return uploadToken;
    }

    iobsService.upload(
        bucket,
        key, 
        file, 
        token, 
        (host, bucket, key, iobsResponse) => {
            if (iobsResponse.isOk()) {
                console.log(iobsResponse.message());
                onSuccess(iobsResponse.message());
            } else {
                onError(iobsResponse.error());
            }
        }, 
        (host, bucket, key, loaded, fileSize) => {
            const percent = Math.min(100, Math.round(loaded / fileSize) * 100);
            onProgress({ percent });
            console.log(`上传进度：${percent}%`)
    
        }
    )
}