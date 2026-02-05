// promiseAllSettled方法实现
export const polyfillPromiseAllsettled = (promisesArray) => {
    return Promise.all(
        promisesArray.map(
            p => Promise.resolve(p).then(
                (val) => ({status: 'fulfilled', val}),
                (err) => ({status: 'rejected', err}),
            )
        )
    )
}