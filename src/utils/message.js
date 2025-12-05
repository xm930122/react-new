/**
 * 兼容antd5 message、notification、modal
 * 
*/

import { App } from 'antd';

let message;
let notification;
let modal;

export default () => {
    const staticFunction = App.useApp();
    message = staticFunction.message;
    notification = staticFunction.notification;
    modal = staticFunction.modal;
    return null;
}

export { message, notification, modal };