// promiseAllSettled方法实现
export const polyfillPromiseAllsettled = (promisesArray) => {
    return Promise.all(
        promisesArray.map(
            it => Promise.resolve(it)
            .then(
                (val) => ({status: 'fulfilled', val}),
                (err) => ({status: 'rejected', err}),
            )
        )
    )
}