/**
 * 知识库组件，微前端父模块
 * props: { basename: '', userId } userId必传，用于流消息接口sendMessage接口传参
*/

import React, { useRef, useLayoutEffect } from 'react';
import { loadMicroApp } from 'qiankun';
import { setDocTitle } from 'utils';
import Loading from 'components/loading';
import 'componets/table/style.less';
import styles from './index.less';

export default () => {
    const ref = useRef(null);
    const userId = (localStorage.getItem('USERID') || '').toUpperCase();

    useLayoutEffect(() => {
        if (window.location.href.indexOf('/know') > -1) {
            setDocTitle('知识库');
        } else {
            setDocTitle('');
        }

        const micoApp = loadMicroApp({
            props: {
                basename: '',
                userId
            },
            name: 'workbench',
            entry: '/module/workbench',
            container: ref.current
        });

        return () => {
            micoApp.unmount();
        }
    }, [])

    return (
        <div ref={ref} className={styles.microAppWrapper}>
            <Loading size="lg" />
        </div>
    )
}

